import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import {
  signInSchema,
  SignInSchema,
  signUpSchema,
  SignUpSchema,
} from "@/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/custom/password-input";
import { createServerFn } from "@tanstack/react-start";
import { registerUserUseCase, signInUseCase } from "@/services/auth";
import { setSession } from "@/lib/session";
import { rateLimitByKey } from "@/lib/limiter";
import { assertAuthenticatedFn } from "@/fn/auth";
import { REDIRECT_AFTER_LOGIN } from "@/constants/config";

const createSignInFn = createServerFn({
  method: "POST",
})
  .validator(signInSchema)
  .handler(async ({ data }) => {
    const validResult = signInSchema.safeParse(data);
    if (!validResult.success) {
      throw new Error(validResult.error.message);
    }

    const { email, password } = validResult.data;

    await rateLimitByKey({ key: email, limit: 3, window: 10000 });
    const user = await signInUseCase(email, password);
    await setSession(user.id);
    return {
      isRedirect: true,
    };
  });

const createSignUpFn = createServerFn({
  method: "POST",
})
  .validator(signUpSchema)
  .handler(async ({ data }) => {
    const validResult = signUpSchema.safeParse(data);
    if (!validResult.success) {
      throw new Error(validResult.error.message);
    }

    const { email, password } = validResult.data;
    await rateLimitByKey({ key: email, limit: 3, window: 10000 });
    const user = await registerUserUseCase(email, password);
    await setSession(user.id as string);
    return {
      isRedirect: true,
    };
  });

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  head: () => ({
    meta: [{ title: "Login", description: "Login/Sign up to your account" }],
  }),
});

function LoginComponent() {
  const navigate = useNavigate();

  const signInForm = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    formState: { isSubmitting: isSignInSubmitting },
  } = signInForm;

  const handleSignIn = async (data: SignInSchema) => {
    try {
      toast.promise(
        createSignInFn({
          data: {
            email: data.email,
            password: data.password,
          },
        }),
        {
          loading: "Signing in...",
          success: () => {
            navigate({ to: REDIRECT_AFTER_LOGIN });
            return "Signed in successfully!";
          },
          error: (error) => `Failed to sign in: ${error.message}`,
        }
      );
    } catch {}
  };

  const signUpForm = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const {
    formState: { isSubmitting: isSignUpSubmitting },
  } = signUpForm;

  const handleSignUp = async (data: SignUpSchema) => {
    try {
      toast.promise(
        createSignUpFn({
          data: {
            email: data.email,
            password: data.password,
            passwordConfirmation: data.passwordConfirmation,
          },
        }),
        {
          loading: "Signing up...",
          success: () => {
            navigate({ to: REDIRECT_AFTER_LOGIN });
            return "Signed up successfully!";
          },
          error: (error) => `Failed to sign up: ${error.message}`,
        }
      );
    } catch {}
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Tabs defaultValue="sign-in" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Sign in to your account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signInForm}>
                <form
                  onSubmit={signInForm.handleSubmit(handleSignIn)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input id="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput id="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSignInSubmitting}>
                    {isSignInSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create an account to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signUpForm}>
                <form
                  onSubmit={signUpForm.handleSubmit(handleSignUp)}
                  className="flex flex-col gap-4"
                >
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input id="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput id="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="passwordConfirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Confirmation</FormLabel>
                        <FormControl>
                          <PasswordInput id="passwordConfirmation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSignUpSubmitting}>
                    {isSignUpSubmitting ? "Signing up..." : "Sign Up"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
