import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createPostMutation = useMutation(
    trpc.post.create.mutationOptions({
      onSuccess: async (data) => {
        console.log("success", data);
        form.reset();
        await queryClient.invalidateQueries(trpc.post.list.pathFilter());
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
      await createPostMutation.mutateAsync(values);
    } catch {}
  };

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

        {createPostMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            Post created successfully!
          </div>
        )}
      </div>

      <Button>Click me to go to the posts page</Button>
    </div>
  );
}
