/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "tanstack-start-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile:
            input.stage === "production"
              ? "developer-production"
              : "developer-dev",
        },
      },
    };
  },
  async run() {
    new sst.aws.TanstackStart("MyWeb");
  },
});
