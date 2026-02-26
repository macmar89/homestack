'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { getLoginSchema, LoginInput } from "@/schema/auth.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "@/i18n/routing"
import { handlePostLogin } from "@/services/auth"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "./ui/form"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('Auth')
  const router = useRouter()

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);

    const result = await handlePostLogin(values);

    if (!result.success) {
      console.log(result)
      setServerError(t(`errors.${result.message}`));
      return;
    }

    if (result.isSuperadmin) {
      router.push("/admin/dashboard");
    }

    if (!result.isSuperadmin) {
      router.push({
        pathname: '/[slug]/dashboard',
        params: { slug: result.defaultOrgSlug }
      });
    }

  };

  return (
    <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('username')}</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t('password')}</FormLabel>
                      <a href="#" className="text-sm underline underline-offset-4 hover:text-primary">
                        {t('forgotPassword')}
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pr-10" // Priestor pre ikonku napravo
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 cursor-pointer" />
                          ) : (
                            <Eye className="h-4 w-4 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive animate-in fade-in zoom-in duration-200">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full">{t('login')}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
