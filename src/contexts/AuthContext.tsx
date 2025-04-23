
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "student@example.com",
    name: "Sample Student",
    role: "student",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "mentor@example.com",
    name: "Sample Mentor",
    role: "mentor",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "admin@example.com",
    name: "Sample Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("projexia_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user (mock authentication)
      const user = MOCK_USERS.find((u) => u.email === email);
      
      if (!user) {
        throw new Error("Invalid credentials");
      }
      
      // Save user to state and localStorage
      setCurrentUser(user);
      localStorage.setItem("projexia_user", JSON.stringify(user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("projexia_user");
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some((u) => u.email === email)) {
        throw new Error("User already exists");
      }
      
      // Create new user
      const newUser: User = {
        id: (MOCK_USERS.length + 1).toString(),
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      };
      
      // Add to mock users (in real app, this would be a DB call)
      MOCK_USERS.push(newUser);
      
      // Log user in
      setCurrentUser(newUser);
      localStorage.setItem("projexia_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
