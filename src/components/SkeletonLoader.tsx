import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex flex-col w-full space-y-space-md animate-pulse" id="state-skeleton">
      <div className="h-16 w-full bg-cloud rounded-2xl"></div>
      <div className="h-44 w-full bg-cloud rounded-3xl"></div>
      <div className="h-28 w-full bg-cloud rounded-3xl"></div>
      <div className="space-y-3 pt-2">
        <div className="h-5 w-32 bg-cloud rounded-md"></div>
        <div className="h-20 w-full bg-cloud rounded-2xl"></div>
        <div className="h-20 w-full bg-cloud rounded-2xl"></div>
        <div className="h-20 w-full bg-cloud rounded-2xl"></div>
      </div>
    </div>
  );
};
