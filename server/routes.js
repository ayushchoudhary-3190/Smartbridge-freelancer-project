import { createServer } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage.js";
import { 
  loginSchema, 
  registerSchema, 
  insertProjectSchema,
  insertApplicationSchema,
  insertMessageSchema,
  insertFreelancerProfileSchema
} from "../shared/schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

export async function registerRoutes(app) {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        userType: userData.userType,
        avatar: null
      });

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Freelancer profile routes
  app.get("/api/freelancers", async (req, res) => {
    try {
      const freelancers = await storage.getAllFreelancers();
      res.json(freelancers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/freelancers/:userId", async (req, res) => {
    try {
      const profile = await storage.getFreelancerProfile(parseInt(req.params.userId));
      if (!profile) {
        return res.status(404).json({ message: "Freelancer profile not found" });
      }
      const user = await storage.getUser(profile.userId);
      res.json({ ...profile, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/freelancers", authenticateToken, async (req, res) => {
    try {
      const profileData = insertFreelancerProfileSchema.parse({
        ...req.body,
        userId: req.userId
      });
      
      const profile = await storage.createFreelancerProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/freelancers/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updates = req.body;
      const profile = await storage.updateFreelancerProfile(userId, updates);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { query, category, skills } = req.query;
      const skillsArray = skills ? skills.split(',') : undefined;
      
      const projects = await storage.searchProjects(
        query,
        category,
        skillsArray
      );
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const client = await storage.getUser(project.clientId);
      const applications = await storage.getApplicationsByProject(project.id);
      
      res.json({ ...project, client, applications });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", authenticateToken, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        clientId: req.userId
      });
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/projects", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const projects = await storage.getProjectsByClient(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Application routes
  app.get("/api/projects/:projectId/applications", authenticateToken, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.clientId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const applications = await storage.getApplicationsByProject(projectId);
      
      // Get freelancer details for each application
      const applicationsWithFreelancers = await Promise.all(
        applications.map(async (app) => {
          const freelancer = await storage.getUser(app.freelancerId);
          const profile = await storage.getFreelancerProfile(app.freelancerId);
          return { ...app, freelancer, profile };
        })
      );

      res.json(applicationsWithFreelancers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects/:projectId/applications", authenticateToken, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        projectId,
        freelancerId: req.userId
      });
      
      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/applications", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const applications = await storage.getApplicationsByFreelancer(userId);
      
      // Get project details for each application
      const applicationsWithProjects = await Promise.all(
        applications.map(async (app) => {
          const project = await storage.getProject(app.projectId);
          const client = await storage.getUser(project.clientId);
          return { ...app, project, client };
        })
      );

      res.json(applicationsWithProjects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/applications/:id", authenticateToken, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const project = await storage.getProject(application.projectId);
      if (project?.clientId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedApplication = await storage.updateApplication(applicationId, { status });
      
      // If application is accepted, update project status and assign freelancer
      if (status === "accepted") {
        await storage.updateProject(application.projectId, {
          status: "in_progress",
          assignedFreelancerId: application.freelancerId
        });
      }

      res.json(updatedApplication);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message routes
  app.get("/api/users/:userId/conversations", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/messages", authenticateToken, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is involved in this project
      const isAuthorized = project.clientId === req.userId || 
                          project.assignedFreelancerId === req.userId;
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const messages = await storage.getMessagesByProject(projectId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects/:projectId/messages", authenticateToken, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        projectId,
        senderId: req.userId
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}