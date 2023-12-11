const DEFAULT_AZURE_MODEL_NAME: string = process.env.DEFAULT_AZURE_MODEL_NAME!;
const DEFAULT_AZURE_DEPLOYMENT_NAME: string = process.env.DEFAULT_AZURE_DEPLOYMENT_NAME!;

export class APIParam {
  name: string;
  nameForPrompt: string | null;
  description: string;
  value: string | null;
  urlParam: boolean;
  type: string;
  expectedFromLLM: boolean;

  constructor(
    name: string,
    description: string,
    type: string,
    nameForPrompt?: string,
    value?: string,
    urlParam: boolean = false,
    expectedFromLLM: boolean = true,
  ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.nameForPrompt = nameForPrompt || null;
    this.value = value || null;
    this.urlParam = urlParam;
    this.expectedFromLLM = expectedFromLLM;
  }
}

export class APIRequest {
  url: string | null;
  method: string | null;
  headers: Record<string, string> | null;
  parameters: APIParam[];

  constructor(parameters: APIParam[], url?: string, method?: string, headers?: Record<string, string>) {
    this.url = url || null;
    this.method = method || null;
    this.headers = headers || null;
    this.parameters = parameters;
  }
}

export class APIResponse {
  expectedStatus: number;
  outputDescription: string | null;

  constructor(outputDescription?: string, expectedStatus: number = 200) {
    this.expectedStatus = expectedStatus;
    this.outputDescription = outputDescription || null;
  }
}

type GenericFunction = (...args: any[]) => any;

export class RestAPITool {
  description: string;
  isActive: boolean;
  request: APIRequest;
  response: APIResponse;
  executeTool: GenericFunction;

  constructor(
    description: string,
    request: APIRequest,
    response: APIResponse,
    func: GenericFunction,
    isActive: boolean = true,
  ) {
    this.description = description;
    this.isActive = isActive;
    this.request = request;
    this.response = response;
    this.executeTool = func;
  }
}

export class RouteToCoreTool {
  description: string;
  isActive: boolean = true;
  request: APIRequest;
  //The name for the intent in core
  intentName: string;

  constructor(description: string, request: APIRequest, intentName: string) {
    this.description = description;
    this.request = request;
    this.intentName = intentName;
  }
}

/**
 * Represents the configuration for a custom agent.
 */
export class CustomAgentConfig {
  /**
   * The temperature parameter.
   */
  temperature: number;

  /**
   * The OpenAI model name.
   */
  modelName: string;

  /**
   * The Azure deployment name.
   */
  deploymentName: string;

  /**
   * The agent's opening message.
   */
  welcomeMessage: string;

  /**
   * The message to be displayed if there is an error executing an LLM call.
   */
  errorMessage: string;

  /**
   * The role of the agent.
   */
  role: string;

  /**
   * The persona of the agent.
   */
  persona: string;

  /**
   * The conversation strategy of the agent.
   */
  conversationStrategy: string;

  /**
   * The tasks associated with the agent.
   */
  tasks: Record<string, string>;

  /**
   * The REST API tools associated with the agent.
   */
  restApiTools: Record<string, RestAPITool>;

  /**
   * The routing tools associated with the agent.
   */
  routingTools: Record<string, RouteToCoreTool>;

  /**
   * The template for the first system prompt sent when the agent starts.
   */
  systemPromptTemplate: string;

  /**
   * The template for sending human input.
   */
  humanInputTemplate: string;

  /**
   * The template for sending tool output to the model.
   */
  toolOutputTemplate: string;

  constructor(
    temperature: number = 0.0,
    welcomeMessage: string = '',
    role: string = '',
    persona: string = '',
    conversationStrategy: string = '',
    tasks: Record<string, string> = {},
    restApiTools: Record<string, RestAPITool> = {},
    routingTools: Record<string, RouteToCoreTool> = {},
    systemPromptTemplate: string = '',
    humanInputTemplate: string = '',
    toolOutputTemplate: string = '',
    errorMessage: string = 'We encountered an error. Would you please repeat?',
    modelName: string = DEFAULT_AZURE_MODEL_NAME,
    deploymentName: string = DEFAULT_AZURE_DEPLOYMENT_NAME,
  ) {
    if (temperature < 0.0 || temperature > 2.0) {
      throw new Error('Temperature must be between 0.0 and 2.0.');
    }
    this.temperature = temperature;
    this.modelName = modelName;
    this.deploymentName = deploymentName;
    this.welcomeMessage = welcomeMessage;
    this.errorMessage = errorMessage;
    this.role = role;
    this.persona = persona;
    this.conversationStrategy = conversationStrategy;
    this.tasks = tasks;
    this.restApiTools = restApiTools;
    this.routingTools = routingTools;
    this.systemPromptTemplate = systemPromptTemplate;
    this.humanInputTemplate = humanInputTemplate;
    this.toolOutputTemplate = toolOutputTemplate;
  }
}
