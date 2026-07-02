type PublicEnvProcess = {
  env?: Record<string, string | undefined>;
};

export function getPublicEnvValue(key: string): string | undefined {
  const processRef = globalThis.process as PublicEnvProcess | undefined;

  return processRef?.env?.[key];
}
