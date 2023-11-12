let DEFAULT_AZURE_DEPLOYMENT_NAME: string = "gpt-4"; //os.getenv("AZURE_DEPLOYMENT_NAME") needs to be replaced

class APIParam {
  name: string;
  name_for_prompt: string | null;
  description: string;
  value: string | null;
  url_param: boolean;
  type: string;
  expected_from_llm: boolean;

  constructor(
    name: string,
    description: string,
    type: string,
    name_for_prompt?: string,
    value?: string,
    url_param: boolean = false,
    expected_from_llm: boolean = true
  ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.name_for_prompt = name_for_prompt || null;
    this.value = value || null;
    this.url_param = url_param;
    this.expected_from_llm = expected_from_llm;
  }
}

class APIRequest {
  url: string | null;
  method: string | null;
  headers: Record<string, string> | null;
  parameters: APIParam[];

  constructor(
    parameters: APIParam[],
    url?: string,
    method?: string,
    headers?: Record<string, string>
  ) {
    this.url = url || null;
    this.method = method || null;
    this.headers = headers || null;
    this.parameters = parameters;
  }
}

class APIResponse {
  expected_status: number;
  output_description: string | null;

  constructor(expected_status: number = 200, output_description?: string) {
    this.expected_status = expected_status;
    this.output_description = output_description || null;
  }
}

type GenericFunction = (...args: any[]) => any;

export class RestAPITool {
  description: string;
  is_active: boolean;
  request: APIRequest;
  response: APIResponse;
  func: GenericFunction;

  constructor(
    description: string,
    request: APIRequest,
    response: APIResponse,
    func: GenericFunction,
    is_active: boolean = true
  ) {
    this.description = description;
    this.is_active = is_active;
    this.request = request;
    this.response = response;
    this.func = func;
  }
}

export class RouteToCoreTool {
  description: string;
  is_active: boolean = true;
  request: APIRequest;
  //The name for the intent in core
  intent_name: string;

  constructor(description: string, request: APIRequest, intent_name: string) {
    this.description = description;
    this.request = request;
    this.intent_name = intent_name;
  }
}

export class CustomAgentConfig {
  //The temperature parameter.
  temperature: number;
  //The OpenAI model name
  model_name: string;
  //The Azure deployment name
  deployment_name: string;
  //The agents opening message.
  welcome_message: string;
  //What the agent should say to the enduser if there is an error executing an LLM call
  error_message: string;
  role: string;
  persona: string;
  conversation_strategy: string;
  tasks: Record<string, string>;
  rest_api_tools: Record<string, RestAPITool>;
  routing_tools: Record<string, RouteToCoreTool>;
  //The first system prompt sent when agent starts
  system_prompt_template: string;
  //Template to send human input
  human_input_template: string;
  //Template to send tool output to model
  tool_output_template: string;

  constructor(
    temperature: number = 0.0,
    model_name: string = "gpt-4",
    deployment_name: string = DEFAULT_AZURE_DEPLOYMENT_NAME,
    welcome_message: string = "",
    error_message: string = "We encountered an error. Would you please repeat?",
    role: string = "",
    persona: string = "",
    conversation_strategy: string = "",
    tasks: Record<string, string> = {},
    rest_api_tools: Record<string, RestAPITool> = {},
    routing_tools: Record<string, RouteToCoreTool> = {},
    system_prompt_template: string = "",
    human_input_template: string = "",
    tool_output_template: string = ""
  ) {
    if (temperature < 0.0 || temperature > 2.0) {
      throw new Error("Temperature must be between 0.0 and 2.0.");
    }
    this.temperature = temperature;
    this.model_name = model_name;
    this.deployment_name = deployment_name;
    this.welcome_message = welcome_message;
    this.error_message = error_message;
    this.role = role;
    this.persona = persona;
    this.conversation_strategy = conversation_strategy;
    this.tasks = tasks;
    this.rest_api_tools = rest_api_tools;
    this.routing_tools = routing_tools;
    this.system_prompt_template = system_prompt_template;
    this.human_input_template = human_input_template;
    this.tool_output_template = tool_output_template;
  }
}
