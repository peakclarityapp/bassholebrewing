"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import { motion } from "framer-motion";

interface RecipeHeroImageProps {
  heroImage?: string;
  name: string;
}

export function RecipeHeroImage({ heroImage, name }: RecipeHeroImageProps) {
  // Resolve storage ID to URL if it looks like a Convex ID
  const isStorageId = heroImage && !heroImage.startsWith("http");
  const resolvedUrl = useQuery(
    api.storage.getUrl,
    isStorageId ? { storageId: heroImage as Id<"_storage"> } : "skip"
  );
  
  const imageUrl = resolvedUrl || (heroImage?.startsWith("http") ? heroImage : null);
  
  if (!imageUrl) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 mb-6"
    >
      <Image
        src={imageUrl}
        alt={`${name} hero image`}
        fill
        className="object-cover"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
    </motion.div>
  );
}
