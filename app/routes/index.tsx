import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "@/trpc/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const posts = await context.queryClient.ensureQueryData(
      context.trpc.post.dbList.queryOptions()
    );
    return { posts };
  },
  component: Home,
});

function Home() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const postQuery = useSuspenseQuery(trpc.post.dbList.queryOptions());

  const createPostMutation = useMutation(
    trpc.post.create.mutationOptions({
      onMutate: async (newPost) => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries({
          queryKey: trpc.post.dbList.queryOptions().queryKey,
        });

        // Snapshot the previous state
        const previousPosts = queryClient.getQueryData(
          trpc.post.dbList.queryOptions().queryKey
        );

        // Optimistically update the cache with the new post
        queryClient.setQueryData(
          trpc.post.dbList.queryOptions().queryKey,
          (old: any) => {
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
            trpc.post.dbList.queryOptions().queryKey,
            context.previousPosts
          );
        }
      },
      onSuccess: (data) => {
        form.reset();
      },
      onSettled: async () => {
        // Always refetch after error or success to ensure the server state
        await queryClient.invalidateQueries({
          queryKey: trpc.post.dbList.queryOptions().queryKey,
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
      toast.error("Failed to create post");
    }
  };

  console.log("postQuery data", postQuery.data);

  return (
    <div className="p-2 flex flex-col gap-4">
      <h3>Welcome Home!!!</h3>
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
    </div>
  );
}
