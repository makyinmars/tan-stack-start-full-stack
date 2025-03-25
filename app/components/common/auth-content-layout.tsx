import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SIDEBAR_COOKIE_NAME,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "vinxi/http";
import { useSuspenseQuery } from "@tanstack/react-query";

// Server function to get a cookie value
export const getCookieValue = createServerFn({ method: "GET" }).handler(
  async () => {
    return getCookie(SIDEBAR_COOKIE_NAME);
  }
);

const AuthContentLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarStateQuery = useSuspenseQuery({
    queryKey: ["sidebar_state"],
    queryFn: () => getCookieValue(),
  });
  return (
    <SidebarProvider defaultOpen={sidebarStateQuery.data === "true"}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AuthContentLayout;
