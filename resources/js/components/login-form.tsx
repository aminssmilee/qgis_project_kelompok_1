import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {},
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = "Email wajib diisi";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Format email tidak valid";
        }

        if (!password) {
            newErrors.password = "Password wajib diisi";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setErrors({});
            // Mendapatkan CSRF cookie
            await api.get("/sanctum/csrf-cookie", { baseURL: "/" });

            const response = await api.post("/admin/login", {
                email: email.trim(),
                password,
            });

            // Simpan token (plainTextToken dari backend)
            if (response.data.token) {
                localStorage.setItem("admin_token", response.data.token);
            }
            
            // Simpan data user jika ada
            if (response.data.data) {
                localStorage.setItem("admin_user", JSON.stringify(response.data.data));
            }

            navigate("/dashboard");
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    email:
                        error.response?.data?.message ||
                        "Terjadi kesalahan saat login",
                });
            }
        }
    };

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            onSubmit={handleSubmit}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">
                        Login to your account
                    </h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Enter your email below to login to your account
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                            "bg-background",
                            errors.email &&
                                "border-destructive focus-visible:ring-destructive",
                        )}
                    />
                    {errors.email && (
                        <p className="text-xs font-medium text-destructive">
                            {errors.email}
                        </p>
                    )}
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            {/* Forgot your password? */}
                        </a>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={cn(
                                "bg-background pr-10",
                                errors.password &&
                                    "border-destructive focus-visible:ring-destructive",
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs font-medium text-destructive">
                            {errors.password}
                        </p>
                    )}
                </Field>
                <Field>
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </Field>
                <Field>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            // Dummy login untuk keperluan development sementara
                            localStorage.setItem("admin_token", "DUMMY_TOKEN");
                            // Optional: simpan info user sederhana
                            localStorage.setItem(
                                "admin_user",
                                JSON.stringify({ name: "Admin Utama", email: "admin@billboards.id", avatar: "/assets/images/logobil.jpeg" }),
                            );
                            navigate("/dashboard");
                        }}
                    >
                        Dummy Login (dev)
                    </Button>
                    <FieldDescription className="text-center text-xs mt-2">
                        Tombol ini hanya untuk development — login sementara tanpa backend.
                    </FieldDescription>
                </Field>
                <FieldSeparator>only admin</FieldSeparator>
            </FieldGroup>
        </form>
    );
}