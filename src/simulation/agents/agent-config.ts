export interface APIParam {
  name: string;
  name_for_prompt?: string | null;
  description: string;
  value?: string | null;
  url_param: boolean;
  type: string;
  expected_from_llm: boolean;
}

export interface APIRequest {
  url: string | null;
  method: string | null;
  headers: { [key: string]: string } | null;
  parameters: APIParam[];
}

export interface APIResponse {
  expected_status: number;
  output_description?: string | null;
}

export interface RestAPITool {
  description: string;
  is_active: boolean;
  request: APIRequest;
  response: APIResponse;
  func: (...args: any[]) => any;
}

export interface RouteToCoreTool {
  description: string;
  is_active: boolean;
  request: APIRequest;
  intent_name: string;
}

export interface AgentConfig {
  temperature: number;
  model_name: string;
  deployment_name: string;
  welcome_message: string;
  error_message: string;
  role: string;
  persona: string;
  conversation_strategy: string;
  tasks: { [key: string]: string };
  rest_api_tools: { [key: string]: RestAPITool };
  routing_tools: { [key: string]: RouteToCoreTool };
  system_prompt_template: string;
  human_input_template: string;
  tool_output_template: string;
}

const DEFAULT_AZURE_DEPLOYMENT_NAME: string | undefined = process.env.AZURE_DEPLOYMENT_NAME;

export const defaultAgentConfig: Pick<
  AgentConfig,
  | 'temperature'
  | 'model_name'
  | 'deployment_name'
  | 'welcome_message'
  | 'error_message'
  | 'role'
  | 'persona'
  | 'conversation_strategy'
  | 'tasks'
  | 'rest_api_tools'
  | 'routing_tools'
  | 'system_prompt_template'
  | 'human_input_template'
  | 'tool_output_template'
> = {
  temperature: 0.0,
  model_name: 'gpt-4',
  deployment_name: DEFAULT_AZURE_DEPLOYMENT_NAME || '',
  welcome_message: '',
  error_message: 'We encountered an error. Would you please repeat?',
  role: '',
  persona: '',
  conversation_strategy: '',
  tasks: {},
  rest_api_tools: {},
  routing_tools: {},
  system_prompt_template: '',
  human_input_template: '',
  tool_output_template: '',
};
