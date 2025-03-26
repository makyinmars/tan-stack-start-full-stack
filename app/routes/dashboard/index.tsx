import AuthContentLayout from "@/components/common/auth-content-layout";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { assertAuthenticatedFn } from "@/fn/auth";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
  loader: async ({ context }) => {
    const posts = await context.queryClient.ensureQueryData(
      context.trpc.post.authList.queryOptions()
    );
    return { posts };
  },
});

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});


function RouteComponent() {

  const trpc = useTRPC();
  const queryClient = useQueryClient();


  const postQuery = useSuspenseQuery(trpc.post.authList.queryOptions());

  const createPostMutation = useMutation(
    trpc.post.create.mutationOptions({
      onMutate: async (newPost) => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries({
          queryKey: trpc.post.authList.queryOptions().queryKey,
        });

        // Snapshot the previous state
        const previousPosts = queryClient.getQueryData(
          trpc.post.authList.queryOptions().queryKey
        );

        // Optimistically update the cache with the new post
        queryClient.setQueryData(
          trpc.post.authList.queryOptions().queryKey,
          (old) => {
            // Create a temporary ID for the optimistic post
            const optimisticPost = {
              id: `temp-${Date.now()}`,
              title: newPost.title,
              body: newPost.body,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return [...(old || []), optimisticPost];
          }
        );

        // Return the snapshot so we can roll back if something goes wrong
        return { previousPosts };
      },
      onError: (err, newPost, context) => {
        // If the mutation fails, use the context we created in onMutate to roll back
        if (context?.previousPosts) {
          queryClient.setQueryData(
            trpc.post.authList.queryOptions().queryKey,
            context.previousPosts
          );
        }
      },
      onSuccess: (data) => {
        console.log("onSuccess", data);
        form.reset();
      },
      onSettled: async () => {
        // Always refetch after error or success to ensure the server state
        await queryClient.invalidateQueries({
          queryKey: trpc.post.authList.queryOptions().queryKey,
        });
      },
    })
  );

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const handleCreatePost = async (values: z.infer<typeof formSchema>) => {
    try {
      toast.promise(createPostMutation.mutateAsync(values), {
        loading: "Creating post...",
        success: "Post created successfully!",
        error: "Failed to create post",
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Failed to create post: ${e.message}`);
      }
    }
  };

  return (
    <AuthContentLayout>
      <PageHeader title="Dashboard" description="Welcome to your dashboard" />

      <div className="my-4">
        <h4 className="text-lg font-medium mb-4">Create New Post</h4>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreatePost)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter post content"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createPostMutation.isPending}
              className="mt-4"
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </form>
        </Form>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Body</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postQuery.data?.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.body}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AuthContentLayout>
  );
}
