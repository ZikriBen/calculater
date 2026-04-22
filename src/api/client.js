const fake = async (label, payload) => {
  console.debug(`[api stub] ${label}`, payload);
  return null;
};

const entityStub = {
  me: async () => ({ id: 'local', email: 'local@dev', full_name: 'Local Dev' }),
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  create: async (data) => ({ id: 'local-' + Date.now(), ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async () => ({ ok: true }),
};

const entities = new Proxy({}, {
  get: (_, name) => ({
    ...entityStub,
    name,
  }),
});

export const api = {
  auth: {
    me: async () => entityStub.me(),
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities,
  integrations: {
    Core: {
      InvokeLLM: async (args) => {
        const res = await fetch('/api/invoke-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args ?? {}),
        });
        if (!res.ok) throw new Error(`invoke-llm ${res.status}`);
        const data = await res.json();
        return args?.response_json_schema ? data : data.text;
      },
      UploadFile: async ({ file }) => {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        return { file_url: dataUrl };
      },
      SendEmail: async (args) => fake('SendEmail', args),
      GenerateImage: async (args) => fake('GenerateImage', args),
      ExtractDataFromUploadedFile: async (args) => fake('ExtractDataFromUploadedFile', args),
    },
  },
};
