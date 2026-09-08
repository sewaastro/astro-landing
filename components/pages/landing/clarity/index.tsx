'use client';

import React from 'react';

import clsx from 'clsx';

import ClarityCSS from './clarity.module.css';
import Image from 'next/image';
import { AstrologyImage } from '@/components/images';
import ChevronRight from '@/components/icons/chevron-right';
import { openAppStore } from '@/lib/constants/app-store';

interface ClarityProps {
  className?: string;
  style?: React.CSSProperties;
}

const Clarity: React.FC<ClarityProps> = ({ className, style }) => {
  return (
    <section
      className={clsx('container mx-auto px-6 lg:px-0 pb-8 md:pb-10 lg:pb-12', className)}
      style={style}
    >
      <div
        className={clsx(
          ClarityCSS.background,
          'px-6 md:px-12 lg:px-20 xl:px-28 py-6 md:py-8 lg:py-9 rounded-3xl md:rounded-[50px] lg:rounded-[74px] flex flex-col-reverse lg:flex-row justify-center lg:justify-between items-center gap-6 md:gap-8 lg:gap-10',
        )}
      >
        <div className="flex-1 w-full lg:w-auto text-center">
          <h2 className="font-tiro-devanagari text-[26px] md:text-[48px] lg:text-[64px] xl:text-[80px] leading-[32px] md:leading-[56px] lg:leading-[80px] xl:leading-[122.57px] text-[#F8F3DF] text-center lg:text-left font-normal">
            Find Clarity today
          </h2>
          <p className="font-mukta text-sm leading-[24px] text-[#FFFFFFCF] mt-2 md:mt-3 lg:mt-4 text-center lg:text-left whitespace-normal md:text-base lg:text-lg xl:text-xl">
            Whether it is love, career, health, or a big decision ahead, our astrologers are ready
            to guide you. Chat now or explore your free tools below.
          </p>
          <div className="mt-6 md:mt-8 flex flex-row flex-nowrap items-center justify-center lg:justify-start gap-2 md:gap-6">
            <button
              type="button"
              onClick={openAppStore}
              className="flex items-center justify-center gap-1 border border-[#F8F3DF] border-[1px] rounded-[24px] h-[34px] py-2 px-4 text-[#F8F3DF] text-xs transition-all duration-300 hover:bg-[#F8F3DF]/10 whitespace-nowrap sm:rounded-3xl sm:h-auto sm:w-auto sm:px-6 sm:py-2.5 sm:text-base md:px-7 lg:px-8"
            >
              <span className="font-mukta text-sm sm:text-base whitespace-nowrap">Chat Now</span>
              <ChevronRight className="!h-6 !w-6 shrink-0" />
            </button>
            <button
              type="button"
              onClick={openAppStore}
              className="bg-[#F8F3DF] rounded-[24px] h-[34px] px-4 py-2 text-black font-mukta text-xs flex items-center justify-center transition-all duration-300 hover:bg-[#F8F3DF]/90 whitespace-nowrap sm:rounded-3xl sm:h-auto sm:w-auto sm:px-6 sm:py-2.5 sm:text-base"
            >
              <span className="whitespace-nowrap">Download App</span>
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
          <Image
            src={AstrologyImage}
            alt="astrology"
            className="max-w-[180px] md:max-w-[220px] lg:max-w-[300px] xl:max-w-[376px] w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Clarity;
