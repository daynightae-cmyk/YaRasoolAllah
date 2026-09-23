import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isRegister, setIsRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      toast({
        title: t("login.success"),
        description: t("login.welcome_back"),
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: t("login.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("register.success"),
        description: t("register.please_login"),
      });
      setIsRegister(false);
    },
    onError: (error: any) => {
      toast({
        title: t("register.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: t("login.error"),
        description: t("login.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: t("register.error"),
        description: t("register.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: t("register.error"),
        description: t("register.passwords_dont_match"),
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-beige-50 to-emerald-100 dark:from-gray-800 dark:via-gray-900 dark:to-emerald-900/20 islamic-pattern flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-gold-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-gold-400/20 rounded-full blur-xl"></div>
      
      <Card className="w-full max-w-md bg-white/90 dark:bg-emerald-900/90 backdrop-blur-sm border border-emerald-100 dark:border-emerald-700 shadow-2xl">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 rounded-2xl shadow-lg">
              <div className="bg-white/20 p-2 rounded-xl">
                <span className="text-2xl font-amiri font-bold text-white block">الكتاب المبين</span>
                <span className="text-xs text-emerald-100 font-inter">عِلْمٌ يُنتَفَعُ بِه</span>
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-amiri font-bold text-emerald-800 dark:text-emerald-200">
            {isRegister ? t("register.title") : t("login.title")}
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 font-inter">
            {isRegister ? t("register.subtitle") : t("login.subtitle")}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isRegister ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-amiri text-emerald-800 dark:text-emerald-200">
                  {t("login.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.email_placeholder")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`${isRTL ? 'text-right' : 'text-left'} border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500`}
                  disabled={loginMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-amiri text-emerald-800 dark:text-emerald-200">
                  {t("login.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("login.password_placeholder")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${isRTL ? 'text-right' : 'text-left'} border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500`}
                  disabled={loginMutation.isPending}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-amiri text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="material-symbols-outlined animate-spin mr-2 rtl:ml-2">refresh</span>
                ) : (
                  <span className="material-symbols-outlined mr-2 rtl:ml-2">login</span>
                )}
                {t("login.login_button")}
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-amiri text-emerald-800 dark:text-emerald-200">
                  {t("register.username")}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("register.username_placeholder")}
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className={`${isRTL ? 'text-right' : 'text-left'} border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500`}
                  disabled={registerMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="font-amiri text-emerald-800 dark:text-emerald-200">
                  {t("register.email")}
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder={t("register.email_placeholder")}
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className={`${isRTL ? 'text-right' : 'text-left'} border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500`}
                  disabled={registerMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="font-amiri text-emerald-800 dark:text-emerald-200">
                  {t("register.password")}
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder={t("register.password_placeholder")}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className={`${isRTL ? 'text-right' : 'text-left'} border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500`}
                  disabled={registerMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="font-amiri text-emerald-800 dark:text-emerald-200">
                  {t("register.confirm_password")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t("register.confirm_password_placeholder")}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className={`${isRTL ? 'text-right' : 'text-left'} border-emerald-200 dark:border-emerald-700 focus:ring-2 focus:ring-emerald-500`}
                  disabled={registerMutation.isPending}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-amiri text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <span className="material-symbols-outlined animate-spin mr-2 rtl:ml-2">refresh</span>
                ) : (
                  <span className="material-symbols-outlined mr-2 rtl:ml-2">person_add</span>
                )}
                {t("register.register_button")}
              </Button>
            </form>
          )}
          
          {/* Social Login Options */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-emerald-900 px-2 text-gray-500 dark:text-gray-400 font-inter">
                  {t("login.or_continue_with")}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3 rtl:space-x-reverse">
              <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700">
                <span className="material-symbols-outlined text-blue-600">account_circle</span>
              </Button>
              <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700">
                <span className="material-symbols-outlined text-blue-500">facebook</span>
              </Button>
              <Button variant="outline" className="flex-1 border-gray-200 dark:border-gray-700">
                <span className="material-symbols-outlined text-gray-900 dark:text-white">smartphone</span>
              </Button>
            </div>
          </div>
          
          {/* Toggle between login and register */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-inter"
            >
              {isRegister ? t("login.already_have_account") : t("login.need_account")}
            </Button>
          </div>
          
          {/* Demo credentials info */}
          <Alert className="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">info</span>
            <AlertDescription className="text-emerald-700 dark:text-emerald-300 font-inter">
              {t("login.demo_info")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
