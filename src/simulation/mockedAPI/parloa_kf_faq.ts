interface Context {
  platform: string;
}
const CONTEXT: Context = { platform: 'Agent_POC' };
const RETRIEVAL_URL: string | undefined = process.env.PARLOA_KF_FAQ_RETRIEVAL_URL;
const KB_ID: string | undefined = process.env.PARLOA_KF_KB_ID;
const COMPANY_REFERENCE_NAME: string | undefined = process.env.PARLOA_KF_FAQ_COMPANY_REFERENCE_NAME;
const PERSONA: string | undefined = process.env.PARLOA_KF_FAQ_PERSONA;

if (RETRIEVAL_URL === undefined || KB_ID === undefined) {
  console.log(RETRIEVAL_URL, KB_ID);
  throw new Error('Parloa FAQ API not configured. Set env vars in .env, see .env.example');
}
interface FAQRequest {
  context: Context;
  input: {
    question: string;
    knowledge_base_id: string;
    company_reference_name: string;
    verbose: boolean;
    model_name: string;
    persona?: string;
  };
}
interface ChoiceResponse {
  choice: string;
  output?: {
    answer: string;
  };
}
// eslint-disable-next-line require-jsdoc, @typescript-eslint/no-unused-vars
async function get_faq_answer(question: string): Promise<string> {
  const request: FAQRequest = {
    context: CONTEXT,
    input: {
      question: question,
      knowledge_base_id: KB_ID ?? '',
      company_reference_name: COMPANY_REFERENCE_NAME ?? 'company', // how to bot referce to the company in the answer
      verbose: false,
      model_name: 'gpt-4',
    },
  };

  if (PERSONA !== undefined) {
    request.input.persona = PERSONA;
  }
  try {
    const response = await fetchWithTimeout(RETRIEVAL_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Error: HTTP status: ' + response.status);
    }
    const data: ChoiceResponse = (await response.json()) as ChoiceResponse;

    if (data.choice === 'SUCCESS' && data.output) {
      return data.output.answer;
    } else {
      return 'No Answer Found';
    }
  } catch (error) {
    console.error('Error:', error);
    return 'No Answer Found';
  }
}

// eslint-disable-next-line require-jsdoc
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 60000): Promise<Response> {
  const timeoutPromise: Promise<Response> = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeout),
  );

  return Promise.race([fetch(url, options), timeoutPromise]);
}
