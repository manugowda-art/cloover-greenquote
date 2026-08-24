"use client";

import SwaggerUI from "swagger-ui-react";

import { openapiSpec } from "@/lib/openapi";

export function SwaggerDocs() {
  return <SwaggerUI spec={openapiSpec} />;
}