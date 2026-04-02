"use client";

import { useRef, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createConversation,
  clearConversation,
  dismissError,
  toggleSidebar,
  setSidebarOpen,
} from "@/store/chat-slice";
import { useStreamChat } from "@/hooks/use-stream-chat";
import { ChatMessage } from "@/components/chat/chat-message";
import { PromptInput } from "@/components/chat/prompt-input";
import { LoadingIndicator } from "@/components/chat/loading-indicator";
import { EmptyState } from "@/components/chat/empty-state";
import { Sidebar } from "@/components/chat/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Bot,
  Trash2,
  X,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ChatContainer() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(
    (state) => state.chat?.conversations ?? []
  );
  const activeConversationId = useAppSelector(
    (state) => state.chat?.activeConversationId ?? null
  );
  const isLoading = useAppSelector((state) => state.chat?.isLoading ?? false);
  const isStreaming = useAppSelector(
    (state) => state.chat?.isStreaming ?? false
  );
  const error = useAppSelector((state) => state.chat?.error ?? null);
  const sidebarOpen = useAppSelector(
    (state) => state.chat?.sidebarOpen ?? true
  );

  const isMobile = useMediaQuery("(max-width: 768px)");
  const { sendMessage, stopStreaming } = useStreamChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(createConversation());
    }
  }, [conversations.length, dispatch]);

  useEffect(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  }, [isMobile, dispatch]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isLoading, isStreaming]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "o") {
        e.preventDefault();
        dispatch(toggleSidebar());
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "n") {
        e.preventDefault();
        dispatch(createConversation());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleSendMessage = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  const handleClearChat = useCallback(() => {
    dispatch(clearConversation());
  }, [dispatch]);

  const handleDismissError = useCallback(() => {
    dispatch(dismissError());
  }, [dispatch]);

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleMobileSheetChange = useCallback(
    (open: boolean) => {
      dispatch(setSidebarOpen(open));
    },
    [dispatch]
  );

  return (
    <div className="flex h-full overflow-hidden">
      {!isMobile && (
        <aside
          className={cn(
            "hidden md:block shrink-0 border-r border-border/50 overflow-hidden",
            "transition-[width] duration-300 ease-in-out",
            sidebarOpen ? "w-72" : "w-0"
          )}
          style={{ willChange: "width" }}
        >
          <div className="h-full w-72">
            <Sidebar />
          </div>
        </aside>
      )}

      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={handleMobileSheetChange}>
          <SheetContent side="left" showCloseButton={false} className="w-72 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex flex-1 flex-col min-w-0 bg-gradient-to-b from-background via-background to-muted/10">
        <header className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleSidebar}
                className="rounded-lg"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen && !isMobile ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />
                </div>
                <div>
                  <h1 className="text-base font-semibold tracking-tight text-foreground line-clamp-1">
                    {activeConversation?.title ?? "AI Chat"}
                  </h1>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    {isStreaming ? "Responding..." : "GPT-4o Mini"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => dispatch(createConversation())}
                className="rounded-lg"
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearChat}
                  className="rounded-lg text-muted-foreground hover:text-destructive"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="shrink-0 px-4 pt-3">
            <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 shadow-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDismissError}
                className="shrink-0 text-destructive/60 hover:text-destructive"
                aria-label="Dismiss error"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl py-4">
            {messages.length === 0 && !isLoading ? (
              <EmptyState />
            ) : (
              <>
                {messages.map((message, index) => {
                  const isLastAssistant =
                    message.role === "assistant" &&
                    index === messages.length - 1 &&
                    isStreaming;

                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isStreaming={isLastAssistant}
                    />
                  );
                })}
                {isLoading && <LoadingIndicator />}
              </>
            )}
          </div>
        </div>

        <PromptInput
          onSubmit={handleSendMessage}
          onStop={stopStreaming}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
