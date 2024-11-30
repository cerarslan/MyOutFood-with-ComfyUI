'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FaGoogle, FaFacebook, FaTiktok, FaInstagram, } from 'react-icons/fa';
import { FaTwitter as FaXTwitter } from 'react-icons/fa6';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const generateToken = useCallback(async () => {
    try {
      if (!window.grecaptcha) {
        setCaptchaToken('bypass_due_to_cookie_restrictions');
        return;
      }

      const token = await Promise.race([
        window.grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
          { action: 'login' }
        ),
        new Promise((_, reject) => 
          setTimeout(() => {
            setCaptchaToken('bypass_due_to_cookie_restrictions');
            reject(new Error('timeout'));
          }, 5000)
        )
      ]) as string;
      
      setCaptchaToken(token);
    } catch (error) {
      setCaptchaToken('bypass_due_to_cookie_restrictions');
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded) {
      generateToken();
    } else {
      // If script isn't loaded after 5 seconds, bypass reCAPTCHA
      const timeout = setTimeout(() => {
        if (!scriptLoaded) {
          setCaptchaToken('bypass_due_to_cookie_restrictions');
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [scriptLoaded, generateToken]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const verifyRecaptcha = async (token: string): Promise<boolean> => {
    try {
      console.log('Token doğrulanıyor...');
      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const verifyData = await verifyResponse.json();
      console.log('Doğrulama yanıtı:', verifyData);
      
      if (!verifyData.success || (verifyData.score && verifyData.score < 0.5)) {
        console.error('reCAPTCHA doğrulama başarısız:', verifyData);
        alert('Güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyip tekrar deneyin.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('reCAPTCHA doğrulama hatası:', error);
      alert('Güvenlik doğrulaması sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      return false;
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      // Directly proceed with social login if script failed to load
      if (scriptError) {
        await signIn(provider, {
          redirect: true,
          callbackUrl: '/'
        });
        return;
      }

      // Try to get token if not already available
      if (!captchaToken) {
        try {
          await generateToken();
        } catch (error) {
          console.log('Token generation skipped due to reCAPTCHA issues');
        }
      }

      // Proceed with login even if token generation failed
      await signIn(provider, {
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Social login error:', error);
      alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      // Directly proceed with guest login if script failed to load
      if (scriptError) {
        router.push('/');
        return;
      }

      // Try to get token if not already available
      if (!captchaToken) {
        try {
          await generateToken();
        } catch (error) {
          console.log('Token generation skipped due to reCAPTCHA issues');
        }
      }

      // Proceed with login even if token generation failed
      router.push('/');
    } catch (error) {
      console.error('Guest login error:', error);
      alert('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md space-y-6 bg-card">
        <h1 className="text-2xl font-bold text-center text-foreground">Giriş Yap</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FaGoogle className="w-5 h-5" />
            <span>Google ile Giriş Yap</span>
          </button>

          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FaFacebook className="w-5 h-5" />
            <span>Facebook ile Giriş Yap</span>
          </button>

          <button
            onClick={() => handleSocialLogin('twitter')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FaXTwitter className="w-5 h-5" />
            <span>X ile Giriş Yap</span>
          </button>

          <button
            onClick={() => handleSocialLogin('instagram')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FaInstagram className="w-5 h-5" />
            <span>Instagram ile Giriş Yap</span>
          </button>

          <button
            onClick={() => handleSocialLogin('tiktok')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FaTiktok className="w-5 h-5" />
            <span>TikTok ile Giriş Yap</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-input"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">veya</span>
            </div>
          </div>

          <button
            onClick={() => handleGuestLogin()}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span>Misafir Olarak Devam Et</span>
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Giriş yapılıyor...
          </div>
        )}
      </div>
    </div>
  );
}
