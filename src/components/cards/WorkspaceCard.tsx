import { MapPin, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface WorkspaceCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  features: string[];
  price: string;
  priceUnit: string;
  rating?: number;
  capacity?: number;
  linkTo: string;
  ctaText?: string;
}

export default function WorkspaceCard({
  image,
  title,
  location,
  features,
  price,
  priceUnit,
  rating,
  capacity,
  linkTo,
  ctaText = 'Book Now'
}: WorkspaceCardProps) {
  return (
    <div className="flex flex-col bg-card rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1">
      {/* 1. Image */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        {rating && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-sm font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* 2. Title */}
        <h3 className="text-lg font-bold text-primary-text mb-1 truncate">{title}</h3>
        
        {/* 3. Location */}
        <div className="flex items-center text-muted-text text-sm mb-4">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* 4. Feature Row (Amenities / Capacity) */}
        <div className="flex flex-wrap gap-2 mb-5">
          {capacity && (
            <span className="inline-flex items-center text-xs font-medium bg-bg text-secondary-text px-2 py-1 rounded-md">
              <Users className="w-3 h-3 mr-1" />
              {capacity} Seats
            </span>
          )}
          {features.slice(0, 3).map((feature, idx) => (
            <span key={idx} className="inline-flex items-center text-xs font-medium bg-bg text-secondary-text px-2 py-1 rounded-md truncate max-w-[120px]">
              {feature}
            </span>
          ))}
          {features.length > 3 && (
            <span className="inline-flex items-center text-xs font-medium bg-bg text-secondary-text px-2 py-1 rounded-md">
              +{features.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          {/* 5. Price */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-text font-medium uppercase tracking-wider">{priceUnit}</span>
            <span className="text-lg font-bold text-primary-text">{price}</span>
          </div>
          
          {/* 6. CTA */}
          <Link 
            to={linkTo}
            className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition-colors"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
}
