import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token gerekli' },
        { status: 400 }
      );
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    console.log('reCAPTCHA doğrulama yanıtı:', data);

    if (!data.success) {
      console.error('reCAPTCHA doğrulama başarısız:', data['error-codes']);
      return NextResponse.json(
        { 
          success: false, 
          message: 'reCAPTCHA doğrulaması başarısız',
          errors: data['error-codes']
        },
        { status: 400 }
      );
    }

    // v3'te score kontrolü yapılır (0.0 - 1.0 arası)
    // 0.5'in altındaki skorlar genellikle bot olarak değerlendirilir
    const response_data = {
      success: true,
      score: data.score,
      message: 'reCAPTCHA doğrulaması başarılı',
      action: data.action,
      hostname: data.hostname,
      timestamp: new Date(data.challenge_ts).toISOString()
    };

    console.log('reCAPTCHA doğrulama başarılı:', response_data);

    return NextResponse.json(response_data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Set-Cookie': 'recaptcha=verified; SameSite=None; Secure'
      }
    });

  } catch (error) {
    console.error('reCAPTCHA doğrulama hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
