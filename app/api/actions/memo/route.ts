import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  createActionHeaders,
  MEMO_PROGRAM_ID,
} from '@solana/actions';
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = (req: Request) => {
  const payload: ActionGetResponse = {
    icon: new URL('/sample-logo.webp', new URL(req.url).origin).toString(),
    label: 'Send Memo',
    description: 'This is a super simple action',
    title: 'Memo Demo',
  };

  return Response.json(payload, {
    headers,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log(err);
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const transaction = new Transaction();

    transaction.add(
      // note: createPostResponse requires 1 non-memo instruction
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from('this is a simple memo message', 'utf8'),
        keys: [],
      })
    );

    transaction.feePayer = account;

    const connection = new Connection(clusterApiUrl('devnet'));
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      // @ts-expect-error type error
      fields: {
        transaction,
      },
      //signers: []
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    console.log(err)
    return Response.json('An unknown error occurred', { status: 400 });
  }
};
