import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { TrendingUp, Shield, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "@/api/communicator";
import { User } from "@/types/task";

interface ResponseDto {
  token: string;
  user: User;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      const response = await HttpClient.POST<ResponseDto>('/api/Auth/login', {
        username: email,
        password,
      });

      console.log('Login response:', response);

      if (response && !response.isError && response.data?.token) {
        localStorage.setItem('token', response.data.token); // Store actual token
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setEmail('');
        setPassword('');
        navigate('/');
      } else {
        // setError('Invalid credentials');
        alert("Login failed: Invalid credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("Login failed: " + error.message);
    }
  };


  const isValidEmail = (value) => {
    return /\S+@\S+\.\S+/.test(value); // simple email regex
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Only show error if it contains "@" but is not a valid email
    if (value.includes("@") && !isValidEmail(value)) {
      setError("Invalid email address");
    } else {
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Task Management</h1>
                <p className="text-muted-foreground">Professional project management solution</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-md bg-status-in-progress/10 border border-status-in-progress/20">
                <BarChart3 className="h-5 w-5 text-status-in-progress" />
              </div>
              <div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">Track project progress with detailed reports and insights</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-md bg-status-review/10 border border-status-review/20">
                <Users className="h-5 w-5 text-status-review" />
              </div>
              <div>
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">Seamlessly work together with your team members</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-md bg-status-done/10 border border-status-done/20">
                <Shield className="h-5 w-5 text-status-done" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">Enterprise-grade security for your sensitive data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-elevated border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to continue managing your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Username/Email Address</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your work username/email"
                    value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-medium">
                  Sign In to Dashboard
                </Button>
              </form>

              {/* <div className="mt-6 text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Forgot your password? <a href="#" className="text-primary hover:underline">Reset here</a>
                </div>
                <div className="border-t pt-4">
                  <Link 
                    to="/" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to Dashboard
                  </Link>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;