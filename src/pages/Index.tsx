
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import StudentDashboard from "@/components/Dashboard/StudentDashboard";
import MentorDashboard from "@/components/Dashboard/MentorDashboard";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-projexia-600"></div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <DashboardLayout>
      {currentUser.role === "student" && <StudentDashboard />}
      {currentUser.role === "mentor" && <MentorDashboard />}
      {currentUser.role === "admin" && <AdminDashboard />}
    </DashboardLayout>
  );
};

export default Index;
