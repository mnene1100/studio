
"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Video, PhoneOutgoing, PhoneIncoming, PhoneMissed } from "lucide-react";

const MOCK_CALLS = [
  { name: 'James Wilson', type: 'video', status: 'incoming', time: '10:15 AM', avatar: 'https://picsum.photos/seed/32/200/200' },
  { name: 'Sophia Chen', type: 'audio', status: 'missed', time: 'Yesterday', avatar: 'https://picsum.photos/seed/65/200/200' },
  { name: 'David Lee', type: 'audio', status: 'outgoing', time: 'Mon, 6:30 PM', avatar: 'https://picsum.photos/seed/12/200/200' },
];

export default function CallsPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Calls</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-2">
        {MOCK_CALLS.map((call, i) => (
          <div key={i} className="flex items-center px-4 py-4 rounded-3xl hover:bg-white/5 transition-all group">
            <Avatar className="w-14 h-14">
              <AvatarImage src={call.avatar} />
              <AvatarFallback>{call.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-white tracking-tight">{call.name}</h3>
              <div className="flex items-center mt-0.5">
                {call.status === 'incoming' && <PhoneIncoming className="w-3 h-3 text-green-500 mr-1.5" />}
                {call.status === 'outgoing' && <PhoneOutgoing className="w-3 h-3 text-blue-500 mr-1.5" />}
                {call.status === 'missed' && <PhoneMissed className="w-3 h-3 text-red-500 mr-1.5" />}
                <span className="text-[11px] text-muted-foreground">{call.time}</span>
              </div>
            </div>
            <div className="flex space-x-1">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-accent/10 transition-all cursor-pointer">
                {call.type === 'video' ? <Video className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
