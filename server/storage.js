import { 
  users, 
  freelancerProfiles, 
  projects, 
  applications, 
  messages, 
  reviews
} from "../shared/schema.js";

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.freelancerProfiles = new Map();
    this.projects = new Map();
    this.applications = new Map();
    this.messages = new Map();
    this.reviews = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Freelancer profile methods
  async getFreelancerProfile(userId) {
    return Array.from(this.freelancerProfiles.values()).find(profile => profile.userId === userId);
  }

  async createFreelancerProfile(insertProfile) {
    const id = this.currentId++;
    const profile = { ...insertProfile, id };
    this.freelancerProfiles.set(id, profile);
    return profile;
  }

  async updateFreelancerProfile(userId, updates) {
    const profile = Array.from(this.freelancerProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.freelancerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async getAllFreelancers() {
    const profiles = Array.from(this.freelancerProfiles.values());
    return profiles.map(profile => {
      const user = this.users.get(profile.userId);
      return { ...profile, user };
    });
  }

  // Project methods
  async getProject(id) {
    return this.projects.get(id);
  }

  async getProjectsByClient(clientId) {
    return Array.from(this.projects.values()).filter(project => project.clientId === clientId);
  }

  async getAllProjects() {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject) {
    const id = this.currentId++;
    const project = { 
      ...insertProject, 
      id, 
      status: "open",
      createdAt: new Date(),
      assignedFreelancerId: null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id, updates) {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async searchProjects(query, category, skills) {
    let projects = Array.from(this.projects.values()).filter(p => p.status === "open");
    
    if (query) {
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (category) {
      projects = projects.filter(p => p.category === category);
    }
    
    if (skills && skills.length > 0) {
      projects = projects.filter(p => 
        skills.some(skill => p.skillsRequired.includes(skill))
      );
    }
    
    return projects;
  }

  // Application methods
  async getApplication(id) {
    return this.applications.get(id);
  }

  async getApplicationsByProject(projectId) {
    return Array.from(this.applications.values()).filter(app => app.projectId === projectId);
  }

  async getApplicationsByFreelancer(freelancerId) {
    return Array.from(this.applications.values()).filter(app => app.freelancerId === freelancerId);
  }

  async createApplication(insertApplication) {
    const id = this.currentId++;
    const application = { 
      ...insertApplication, 
      id, 
      status: "pending",
      createdAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id, updates) {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Message methods
  async getMessagesByProject(projectId) {
    return Array.from(this.messages.values())
      .filter(msg => msg.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getConversations(userId) {
    const userMessages = Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.receiverId === userId);
    
    const projectGroups = new Map();
    userMessages.forEach(msg => {
      if (!projectGroups.has(msg.projectId)) {
        projectGroups.set(msg.projectId, []);
      }
      projectGroups.get(msg.projectId).push(msg);
    });

    const conversations = [];
    for (const [projectId, messages] of projectGroups) {
      const project = this.projects.get(projectId);
      const sortedMessages = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const lastMessage = sortedMessages[0];
      const unreadCount = messages.filter(msg => 
        msg.receiverId === userId && !msg.isRead
      ).length;
      
      conversations.push({ projectId, project, lastMessage, unreadCount });
    }

    return conversations.sort((a, b) => 
      b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );
  }

  async createMessage(insertMessage) {
    const id = this.currentId++;
    const message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      isRead: false
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id) {
    const message = this.messages.get(id);
    if (message) {
      this.messages.set(id, { ...message, isRead: true });
    }
  }

  // Review methods
  async getReviewsByReviewee(revieweeId) {
    return Array.from(this.reviews.values()).filter(review => review.revieweeId === revieweeId);
  }

  async createReview(insertReview) {
    const id = this.currentId++;
    const review = { 
      ...insertReview, 
      id, 
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();