import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // TODO: Validar body con Zod y crear link real en Mercado Pago API
    await request.json();
    // TODO: Guardar registro de pago intent en DB

    const paymentLink =
      'https://www.mercadopago.com/checkout/stub-placeholder-emerald-mining';

    return NextResponse.json({ url: paymentLink }, { status: 200 });
  } catch (err) {
    console.error('Error creating payment link:', err);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  return NextResponse.json(
    { message: 'OK' },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
