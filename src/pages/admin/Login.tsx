import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cake, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Backend response type
interface AuthResponse {
  token: string;
  username: string;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post<AuthResponse>(
        "http://localhost:9090/api/admin/login",
        {
          username: formData.username,
          password: formData.password,
        }
      );

      const data = res.data;

      if (data && data.token) {
        localStorage.setItem("admin-token", data.token);
        localStorage.setItem("admin-username", data.username);

        toast({
          title: "Login Successful",
          description: `Welcome, ${data.username}!`,
        });

        navigate("/admin");
      } else {
        toast({
          title: "Login Failed",
          description: "Unexpected server response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Invalid username or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen secondary-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card">
          <CardHeader className="text-center space-y-4">
            <div className="bg-black/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Cake className="h-8 w-8 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-black">
                Admin Login
              </CardTitle>
              <CardDescription className="text-black/80">
                Sweet Delights Management Portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-black">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username"
                    className="bg-black/10 border-black/20 text-black placeholder-black/60"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-black">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter your password"
                      className="bg-black/10 border-black/20 text-black placeholder-black/60 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-black/60 hover:text-black"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-secondary hover:bg-black/90"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-black/20 text-center">
              <Link
                to="/"
                className="text-black/80 hover:text-black text-sm transition-colors"
              >
                ← Back to Website
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
