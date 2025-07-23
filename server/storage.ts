import { 
  users, 
  freelancerProfiles, 
  projects, 
  applications, 
  messages, 
  reviews,
  type User, 
  type InsertUser,
  type FreelancerProfile,
  type InsertFreelancerProfile,
  type Project,
  type InsertProject,
  type Application,
  type InsertApplication,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Freelancer profile methods
  getFreelancerProfile(userId: number): Promise<FreelancerProfile | undefined>;
  createFreelancerProfile(profile: InsertFreelancerProfile): Promise<FreelancerProfile>;
  updateFreelancerProfile(userId: number, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile | undefined>;
  getAllFreelancers(): Promise<(FreelancerProfile & { user: User })[]>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  searchProjects(query?: string, category?: string, skills?: string[]): Promise<Project[]>;

  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByProject(projectId: number): Promise<Application[]>;
  getApplicationsByFreelancer(freelancerId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;

  // Message methods
  getMessagesByProject(projectId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<{ projectId: number; project: Project; lastMessage: Message; unreadCount: number }[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;

  // Review methods
  getReviewsByReviewee(revieweeId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private freelancerProfiles: Map<number, FreelancerProfile>;
  private projects: Map<number, Project>;
  private applications: Map<number, Application>;
  private messages: Map<number, Message>;
  private reviews: Map<number, Review>;
  private currentId: number;

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
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Freelancer profile methods
  async getFreelancerProfile(userId: number): Promise<FreelancerProfile | undefined> {
    return Array.from(this.freelancerProfiles.values()).find(profile => profile.userId === userId);
  }

  async createFreelancerProfile(insertProfile: InsertFreelancerProfile): Promise<FreelancerProfile> {
    const id = this.currentId++;
    const profile: FreelancerProfile = { ...insertProfile, id };
    this.freelancerProfiles.set(id, profile);
    return profile;
  }

  async updateFreelancerProfile(userId: number, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile | undefined> {
    const profile = Array.from(this.freelancerProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.freelancerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async getAllFreelancers(): Promise<(FreelancerProfile & { user: User })[]> {
    const profiles = Array.from(this.freelancerProfiles.values());
    return profiles.map(profile => {
      const user = this.users.get(profile.userId)!;
      return { ...profile, user };
    });
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.clientId === clientId);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      status: "open",
      createdAt: new Date(),
      assignedFreelancerId: null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async searchProjects(query?: string, category?: string, skills?: string[]): Promise<Project[]> {
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
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByProject(projectId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.projectId === projectId);
  }

  async getApplicationsByFreelancer(freelancerId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.freelancerId === freelancerId);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentId++;
    const application: Application = { 
      ...insertApplication, 
      id, 
      status: "pending",
      createdAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Message methods
  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getConversations(userId: number): Promise<{ projectId: number; project: Project; lastMessage: Message; unreadCount: number }[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.receiverId === userId);
    
    const projectGroups = new Map<number, Message[]>();
    userMessages.forEach(msg => {
      if (!projectGroups.has(msg.projectId)) {
        projectGroups.set(msg.projectId, []);
      }
      projectGroups.get(msg.projectId)!.push(msg);
    });

    const conversations = [];
    for (const [projectId, messages] of projectGroups) {
      const project = this.projects.get(projectId)!;
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

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      isRead: false
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      this.messages.set(id, { ...message, isRead: true });
    }
  }

  // Review methods
  async getReviewsByReviewee(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.revieweeId === revieweeId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
