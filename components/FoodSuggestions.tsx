import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FoodSuggestion {
  name: string;
  description: string;
  rating: number;
  image: string;
}

interface FoodSuggestionsProps {
  suggestions: FoodSuggestion[];
}

const FoodSuggestions: React.FC<FoodSuggestionsProps> = ({ suggestions }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Slider {...settings}>
        {suggestions.map((suggestion, index) => (
          <div key={index} className="px-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{suggestion.name}</CardTitle>
                <CardDescription>Rating: {suggestion.rating}/5</CardDescription>
              </CardHeader>
              <CardContent>
                <img src={suggestion.image} alt={suggestion.name} className="w-full h-48 object-cover rounded-md" />
                <p className="mt-4">{suggestion.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Daha Fazla Bilgi</Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

const SampleNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} before:content-['→']`}
      style={{ ...style, display: "block", background: "black", borderRadius: "50%" }}
      onClick={onClick}
    />
  );
};

const SamplePrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} before:content-['←']`}
      style={{ ...style, display: "block", background: "black", borderRadius: "50%" }}
      onClick={onClick}
    />
  );
};

export default FoodSuggestions;
