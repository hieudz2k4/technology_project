"use client";

import { useState } from "react";
import VietnamFlag from "@/components/VietnamFlag";
import Celebration from "@/components/Celebration";
import SoundBoard from "@/components/SoundBoard";
import AffiliateModal from "@/components/AffiliateModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSoundInteraction = () => {
    setIsModalOpen(true);
  };

  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <VietnamFlag />
      <Celebration />
      <SoundBoard onInteraction={handleSoundInteraction} />
      <AffiliateModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </main>
  );
}
