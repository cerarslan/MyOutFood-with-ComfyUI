import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';
import { FaTiktok, FaFacebook, FaGoogle } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface SocialShareProps {
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ className }) => {
  const iconSize = "w-7 h-7";

  // Paylaşım için kullanılacak bilgiler
  const shareUrl = 'https://myoutfood.app';  // Sitenizin URL'si
  const shareTitle = 'MyOutFood - Yemek fotoğraflarınız ile restoranlar bulun!';
  const shareText = 'MyOutFood ile yemek fotoğraflarınız ile harika restoranlar keşfedin!';

  // Paylaşım URL'lerini oluştur
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const mailShareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
  const googleShareUrl = `https://plus.google.com/share?url=${encodeURIComponent(shareUrl)}`;
  const tiktokShareUrl = `https://www.tiktok.com/upload?url=${encodeURIComponent(shareUrl)}`;
  
  const handleShare = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  return (
    <div className={`flex items-center space-x-6 ${className || ''}`}>
      <Link href="#" onClick={(e) => handleShare(e, facebookShareUrl)} className="hover:opacity-80 transition-opacity">
        <FaFacebook className={`${iconSize} text-foreground`} />
      </Link>

      <Link href="#" onClick={(e) => handleShare(e, googleShareUrl)} className="hover:opacity-80 transition-opacity">
        <FaGoogle className={`${iconSize} text-foreground`} />
      </Link>

      <Link href="#" onClick={(e) => handleShare(e, twitterShareUrl)} className="hover:opacity-80 transition-opacity">
        <FaXTwitter className={`${iconSize} text-foreground`} />
      </Link>
      
      <Link href="#" onClick={(e) => handleShare(e, tiktokShareUrl)} className="hover:opacity-80 transition-opacity">
        <FaTiktok className={`${iconSize} text-foreground`} />
      </Link>
      
      <Link href="https://www.instagram.com/create/story" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        <Instagram className={`${iconSize} text-foreground`} />
      </Link>
      
      <Link href={mailShareUrl} className="hover:opacity-80 transition-opacity">
        <Mail className={`${iconSize} text-foreground`} />
      </Link>
    </div>
  );
};

export default SocialShare;
