import { z } from "zod";

export const toolResponse = <T>(data: T) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

export const toolError = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });

export const parseToolBody = async <T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T>; error?: undefined } | { data?: undefined; error: Response }> => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: toolError("Invalid JSON body", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: toolError(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        400
      ),
    };
  }
  return { data: parsed.data };
};

export type ToolStatus = "idle" | "loading" | "success" | "error";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
