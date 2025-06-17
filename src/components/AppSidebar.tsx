
import { useState } from "react";
import { Plus, Trash2, Rss, Globe } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AddFeedDialog } from "@/components/AddFeedDialog";
import { RSSFeed, Article } from "@/types/rss";

interface AppSidebarProps {
  feeds: RSSFeed[];
  onAddFeed: (feed: RSSFeed, articles: Article[]) => void;
  onRemoveFeed: (feedId: string) => void;
  selectedFeed: string | null;
  onSelectFeed: (feedId: string | null) => void;
}

export function AppSidebar({ 
  feeds, 
  onAddFeed, 
  onRemoveFeed, 
  selectedFeed, 
  onSelectFeed 
}: AppSidebarProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Rss className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-900">RSS Feeds</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            All Feeds
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedFeed === null}
                  onClick={() => onSelectFeed(null)}
                  className="w-full justify-start text-left hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                >
                  <Globe className="h-4 w-4" />
                  <span>All Articles</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {feeds.reduce((acc, feed) => acc + (feed.lastUpdated ? 1 : 0), 0) * 3}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Your Feeds
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {feeds.map((feed) => (
                <SidebarMenuItem key={feed.id}>
                  <SidebarMenuButton
                    isActive={selectedFeed === feed.id}
                    onClick={() => onSelectFeed(feed.id)}
                    className="w-full justify-start text-left hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 group"
                  >
                    <span className="text-lg mr-2">{feed.favicon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{feed.title}</div>
                      <div className="text-xs text-gray-500 truncate">{feed.description}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFeed(feed.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add RSS Feed
        </Button>
      </SidebarFooter>

      <AddFeedDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddFeed={onAddFeed}
      />
    </Sidebar>
  );
}
