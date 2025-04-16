export interface AggregatedVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    source: "embedded";
    videoUrl: string;
    duration: string;
    views: string;
    publishedAt: string;
    channelName: string;
    channelId: string;
    isFree: boolean;
  }