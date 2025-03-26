import { Fragment } from "react/jsx-runtime";
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
import ModeToggle from "../custom/mode-toggle";
import { Link, useLocation } from '@tanstack/react-router';

// Server function to get a cookie value
export const getCookieValue = createServerFn({ method: "GET" }).handler(
  async () => {
    return getCookie(SIDEBAR_COOKIE_NAME);
  }
);

// Capitalize and format path segments for display
const formatPathSegment = (segment: string) => {
  // Replace hyphens and underscores with spaces
  const formatted = segment.replace(/[-_]/g, " ");
  // Capitalize first letter of each word
  return formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AuthContentLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarStateQuery = useSuspenseQuery({
    queryKey: ["sidebar_state"],
    queryFn: () => getCookieValue(),
  });
  const location = useLocation();

  const pathname = location.pathname;

  // Split the path into segments and remove empty segments
  const pathSegments = pathname.split("/").filter(Boolean);

  // Generate the page title based on the last path segment or default to "Dashboard"
  const pageTitle =
    pathSegments.length > 0
      ? formatPathSegment(pathSegments[pathSegments.length - 1] || "")
      : "Dashboard";

  return (
    <SidebarProvider defaultOpen={sidebarStateQuery.data === "true"}>
      <AppSidebar />
      <SidebarInset className="flex flex-col gap-4 p-4">
        <header className="items-start justify-between gap-4 rounded-xl bg-muted px-6 py-4 sm:flex">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="font-semibold text-xl tracking-tight">{pageTitle}</h1>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.length > 0 ? (
                  <>
                    {/* Generate breadcrumb items for each path segment except the last one */}
                    {pathSegments.slice(0, -1).map((segment, index) => {
                      const href = `/${pathSegments
                        .slice(0, index + 1)
                        .join("/")}`;
                      return (
                        <Fragment key={segment}>
                          <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                              <Link to={href}>
                                {formatPathSegment(segment)}
                              </Link>
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator className="hidden md:block" />
                        </Fragment>
                      );
                    })}

                    {/* Current page (last segment) */}
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {formatPathSegment(
                          pathSegments[pathSegments.length - 1] || "",
                        )}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  // If we're at the root path
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mt-4 flex items-center sm:mt-0">
            <ModeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AuthContentLayout;
