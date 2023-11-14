interface Context {
  platform: string;
}
const context: Context = { platform: 'Agent_POC' };
const retrievalUrl: string | undefined = process.env.PARLOA_KF_FAQ_RETRIEVAL_URL;
const kbID: string | undefined = process.env.PARLOA_KF_KB_ID;
const companyReferenceName: string | undefined = process.env.PARLOA_KF_FAQ_COMPANY_REFERENCE_NAME;
const persona: string | undefined = process.env.PARLOA_KF_FAQ_PERSONA;

if (retrievalUrl === undefined || kbID === undefined) {
  console.log(retrievalUrl, kbID);
  throw new Error('Parloa FAQ API not configured. Set env vars in .env, see .env.example');
}
interface FAQRequest {
  context: Context;
  input: {
    question: string;
    knowledgeBaseId: string;
    companyReferenceName: string;
    verbose: boolean;
    modelName: string;
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
async function getFaqAnswer(question: string): Promise<string> {
  const request: FAQRequest = {
    context: context,
    input: {
      question: question,
      knowledgeBaseId: kbID ?? '',
      companyReferenceName: companyReferenceName ?? 'company', // how to bot referce to the company in the answer
      verbose: false,
      modelName: 'gpt-4',
    },
  };

  if (persona !== undefined) {
    request.input.persona = persona;
  }
  try {
    const response = await fetchWithTimeout(retrievalUrl!, {
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
