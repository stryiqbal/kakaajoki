"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Camera,
  House,
  MessageCircle,
  Music2,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
  handoff?: boolean;
};

const quickQuestions = [
  {
    question: "Bagaimana cara order?",
    answer:
      "Pilih layanan dan paket di website, isi detail yang diminta, lalu tinjau ringkasan sebelum melanjutkan pesanan.",
  },
  {
    question: "Berapa lama pengerjaannya?",
    answer:
      "Estimasi pengerjaan umumnya 12-48 jam, bergantung pada layanan dan tingkat kesulitannya.",
  },
  {
    question: "Apakah perlu mengirim password?",
    answer:
      "Jika layanan memerlukan akses akun, isi data hanya melalui formulir pemesanan resmi di website. Jangan kirim password atau kode OTP lewat chatbot atau WhatsApp.",
  },
];

const actionCardClassName =
  "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#19191c] p-3 text-left transition hover:border-white/20 hover:bg-[#202024]";
const launcherPositionStorageKey = "kakaajoki-floating-cs-y";

export default function FloatingCS() {
  const [isOpen, setIsOpen] = useState(false);
  const [launcherY, setLauncherY] = useState(0);
  const [launcherPositionRestored, setLauncherPositionRestored] = useState(false);
  const [view, setView] = useState<"home" | "inbox" | "chat" | "contact">("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const botTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animatedMessageIdsRef = useRef(new Set<number>());
  const launcherPointerRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetY: number;
  } | null>(null);
  const didDragLauncherRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view, isBotTyping]);

  useEffect(() => {
    try {
      const savedPosition = window.localStorage.getItem(launcherPositionStorageKey);
      const parsedPosition = savedPosition === null ? 0 : Number(savedPosition);
      if (Number.isFinite(parsedPosition)) {
        const highestY = Math.min(0, 96 - window.innerHeight);
        setLauncherY(Math.max(highestY, Math.min(0, parsedPosition)));
      }
    } catch {
      setLauncherY(0);
    }
    setLauncherPositionRestored(true);
  }, []);

  useEffect(() => {
    if (!launcherPositionRestored) return;
    try {
      window.localStorage.setItem(launcherPositionStorageKey, String(launcherY));
    } catch {
      return;
    }
  }, [launcherY, launcherPositionRestored]);

  useEffect(() => {
    const clampLauncherPosition = () => {
      const highestY = Math.min(0, 96 - window.innerHeight);
      setLauncherY((currentY) => Math.max(highestY, Math.min(0, currentY)));
    };
    window.addEventListener("resize", clampLauncherPosition);
    return () => window.removeEventListener("resize", clampLauncherPosition);
  }, []);

  useEffect(
    () => () => {
      if (botTypingTimeoutRef.current) clearTimeout(botTypingTimeoutRef.current);
    },
    [],
  );

  const startConversation = () => {
    setView("chat");
    if (messages.length || isBotTyping) return;

    setIsBotTyping(true);
    botTypingTimeoutRef.current = setTimeout(() => {
      animatedMessageIdsRef.current.add(1);
      setMessages((currentMessages) =>
        currentMessages.length
          ? currentMessages
          : [{ id: 1, sender: "bot", text: "Halo! Ada yang bisa saya bantu?" }],
      );
      setIsBotTyping(false);
      botTypingTimeoutRef.current = null;
    }, 750);
  };

  const sendMessage = async (text: string) => {
    const userText = text.trim();
    if (!userText || isSending || isBotTyping) return;

    const nextId = messages.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1;
    const history = messages.map((item) => ({
      role: item.sender === "bot" ? "assistant" : "user",
      content: item.text,
    }));

    animatedMessageIdsRef.current.add(nextId);
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: nextId, sender: "user", text: userText },
    ]);
    setMessageInput("");
    setView("chat");
    setIsSending(true);
    botTypingTimeoutRef.current = setTimeout(() => {
      setIsBotTyping(true);
      botTypingTimeoutRef.current = null;
    }, 350);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        reply?: string;
        handoff?: boolean;
      };

      if (!response.ok || !result.reply) {
        throw new Error(result.error ?? "Chatbot belum bisa menjawab.");
      }

      animatedMessageIdsRef.current.add(nextId + 1);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: nextId + 1,
          sender: "bot",
          text: result.reply!,
          handoff: result.handoff,
        },
      ]);
    } catch (error) {
      animatedMessageIdsRef.current.add(nextId + 1);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: nextId + 1,
          sender: "bot",
          text:
            error instanceof Error
              ? error.message
              : "Chatbot belum bisa menjawab. Hubungi admin melalui WhatsApp.",
          handoff: true,
        },
      ]);
    } finally {
      if (botTypingTimeoutRef.current) {
        clearTimeout(botTypingTimeoutRef.current);
        botTypingTimeoutRef.current = null;
      }
      setIsSending(false);
      setIsBotTyping(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(messageInput);
  };

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/6288706392829",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleLauncherPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    launcherPointerRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetY: launcherY,
    };
    didDragLauncherRef.current = false;
    event.currentTarget.style.transition = "none";
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleLauncherPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const pointer = launcherPointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 4) {
      didDragLauncherRef.current = true;
    }

    const highestOffset = Math.min(0, 96 - window.innerHeight);
    const nextOffsetY = Math.max(
      highestOffset,
      Math.min(0, pointer.startOffsetY + deltaY),
    );
    const lowestOffsetX = Math.min(0, 96 - window.innerWidth);
    const nextOffsetX = Math.max(lowestOffsetX, Math.min(0, deltaX));
    event.currentTarget.style.top = `${nextOffsetY}px`;
    event.currentTarget.style.left = `${nextOffsetX}px`;
  };

  const handleLauncherPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (launcherPointerRef.current?.pointerId !== event.pointerId) return;

    launcherPointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setLauncherY(Number.parseFloat(event.currentTarget.style.top) || 0);
    event.currentTarget.style.transition = "left 180ms ease-out";
    event.currentTarget.style.left = "0px";
  };

  return (
    <>
      <div className="floating-cs-container fixed bottom-4 right-4 z-50">
        {!isOpen && launcherPositionRestored && (
          <motion.button
            type="button"
            onClick={() => {
              if (didDragLauncherRef.current) {
                didDragLauncherRef.current = false;
                return;
              }
              setIsOpen(true);
            }}
            aria-label="Buka chat bantuan"
            aria-expanded={false}
            onPointerDown={handleLauncherPointerDown}
            onPointerMove={handleLauncherPointerMove}
            onPointerUp={handleLauncherPointerUp}
            onPointerCancel={handleLauncherPointerUp}
            style={{ top: launcherY }}
            whileHover={{ scale: 1.05 }}
            className="group relative flex size-[72px] touch-none cursor-grab items-center justify-center bg-transparent p-0 shadow-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <Image
              src="/lainnya/Avatar Cs.png"
              alt=""
              width={128}
              height={128}
              draggable={false}
              className="pointer-events-none size-full object-contain"
            />
          </motion.button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Chat bantuan Kakaa.Joki"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className={`absolute bottom-0 right-0 flex h-[min(600px,calc(100dvh-32px))] w-[min(420px,calc(100vw-32px))] origin-bottom-right flex-col overflow-hidden rounded-xl text-white shadow-2xl shadow-black/50 ${
                view === "home"
                  ? "page-background text-white"
                  : "bg-white"
              }`}
            >
              <header
                className={`${
                  view === "chat" || view === "contact"
                    ? "grid h-[82px] shrink-0 grid-cols-[40px_minmax(0,1fr)_40px] grid-rows-[40px_1fr] items-center gap-x-2 px-4 py-2"
                    : "flex h-[62px] shrink-0 items-center justify-between px-4"
                } ${
                  view === "home"
                    ? "bg-transparent"
                    : "border-b border-white/10 page-background"
                }`}
              >
                {view === "chat" || view === "contact" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setView(view === "chat" ? "inbox" : "home")}
                      aria-label={view === "chat" ? "Kembali ke daftar pesan" : "Kembali ke beranda"}
                      className="cursor-pointer col-start-1 row-start-1 justify-self-start rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeft size={17} />
                    </button>
                    <p className="col-start-2 row-start-1 text-center text-sm font-semibold text-white">
                      {view === "chat" ? "Pesan chat" : "Customer service"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Tutup chat"
                      className="cursor-pointer col-start-3 row-start-1 justify-self-end rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                    <p className="col-start-2 row-start-2 text-center text-[10px] leading-4 text-white/70">
                      {view === "chat"
                        ? "Jawaban Otomatis | Dihasilkan Bot"
                        : "Hubungi kami melalui akun resmi"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Image
                        src="/home/logo.png?v=3"
                        alt=""
                        width={72}
                        height={72}
                        className="size-9 shrink-0 object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Tutup chat"
                        className="cursor-pointer rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                )}
              </header>

              {view === "home" && (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent p-5">
                  <div className="mb-5">
                    <p className="text-3xl text-white" aria-hidden="true">
                      <span className="text-[32px] leading-none">👋🏻</span>
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      Hallo!
                    </h2>
                    <p className="mt-1 text-sm text-white/80">
                      Ada yang bisa kami bantu?
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startConversation}
                    className={actionCardClassName}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                      <Bot size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-white">
                        Punya pertanyaan?
                      </span>
                      <span className="mt-1 block text-xs text-zinc-400">
                        Mulai chat dengan Bot Kakaajoki
                      </span>
                    </span>
                    <ArrowRight size={17} className="shrink-0 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("contact")}
                    className={`${actionCardClassName} mt-2`}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                      <Bot size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-white">
                        Customer service
                      </span>
                      <span className="mt-1 block text-xs text-zinc-400">
                        WhatsApp, TikTok, dan Instagram
                      </span>
                    </span>
                    <ArrowRight size={17} className="shrink-0 text-white" />
                  </button>

                  <div className="mt-auto border-t border-white/10 pt-4 text-[11px] leading-5 text-white/70">
                    JANGAN KIRIM PASSWORD DI CHATBOT.
                  </div>
                </div>
              )}

              {view === "contact" && (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#111114] p-5">
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://wa.me/6288706392829"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionCardClassName}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                        <MessageCircle size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-white">WhatsApp</span>
                        <span className="mt-1 block text-xs text-zinc-400">Contact admin</span>
                      </span>
                      <ArrowRight size={17} className="shrink-0 text-white" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@kakaajoki"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionCardClassName}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                        <Music2 size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-white">TikTok</span>
                        <span className="mt-1 block text-xs text-zinc-400">@kakaajoki</span>
                      </span>
                      <ArrowRight size={17} className="shrink-0 text-white" />
                    </a>
                    <a
                      href="https://www.instagram.com/kakaajoki/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionCardClassName}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                        <Camera size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-white">Instagram</span>
                        <span className="mt-1 block text-xs text-zinc-400">@kakaajoki</span>
                      </span>
                      <ArrowRight size={17} className="shrink-0 text-white" />
                    </a>
                  </div>
                </div>
              )}

              {view === "inbox" && (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-[#111114] p-5">
                  <h2 className="text-lg font-semibold text-white">Pesan</h2>
                  {messages.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setView("chat")}
                      className="cursor-pointer mt-4 flex items-start gap-3 rounded-lg border border-white/10 bg-[#19191c] p-3 text-left transition hover:border-white/20 hover:bg-[#202024]"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                        <Bot size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-white">
                          Bot Kakaajoki
                        </span>
                        <span className="mt-1 block truncate text-xs text-zinc-400">
                          {messages[messages.length - 1].text}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <span className="flex size-12 items-center justify-center rounded-full bg-white/5 text-zinc-400">
                        <MessageCircle size={21} />
                      </span>
                      <p className="mt-3 text-sm font-medium text-white">
                        Belum ada percakapan
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Mulai chat untuk bertanya tentang layanan.
                      </p>
                      <button
                        type="button"
                        onClick={startConversation}
                        className="cursor-pointer mt-4 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                      >
                        Mulai percakapan baru
                      </button>
                    </div>
                  )}
                </div>
              )}

              {view === "chat" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div
                    role="log"
                    aria-live="polite"
                    className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#111114] p-4"
                  >
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={
                          animatedMessageIdsRef.current.has(message.id)
                            ? {
                                opacity: 0,
                                x: message.sender === "bot" ? -12 : 12,
                                y: 6,
                              }
                            : false
                        }
                          onAnimationStart={() => animatedMessageIdsRef.current.delete(message.id)}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className={`flex items-end gap-2 ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.sender === "bot" && (
                          <span className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                            <Bot size={15} />
                          </span>
                        )}
                        <div
                          className={`max-w-[84%] rounded-xl px-3 py-2.5 text-xs leading-5 ${
                            message.sender === "user"
                              ? "rounded-br-sm bg-red-600 text-white"
                              : "rounded-bl-sm bg-[#242428] text-zinc-100"
                          }`}
                        >
                          <p>{message.text}</p>
                          {message.handoff && (
                            <button
                              type="button"
                              onClick={openWhatsApp}
                              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 font-semibold text-red-400 underline underline-offset-2"
                            >
                              Hubungi admin di WhatsApp
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isBotTyping && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, y: 4 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex items-end gap-2"
                      >
                        <span className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                          <Bot size={15} />
                        </span>
                        <div
                          role="status"
                          aria-label="Bot sedang mengetik"
                          className="flex h-9 items-center gap-1 rounded-xl rounded-bl-sm bg-[#242428] px-3"
                        >
                          {[0, 1, 2].map((dotIndex) => (
                            <motion.span
                              key={dotIndex}
                              animate={{ y: [0, -3, 0] }}
                              transition={{
                                duration: 0.65,
                                delay: dotIndex * 0.12,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="size-1.5 rounded-full bg-zinc-400"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {messages.length === 1 && (
                      <div className="mt-1 flex flex-col gap-2 pl-9">
                        {quickQuestions.map((item, index) => (
                          <motion.button
                            key={item.question}
                            type="button"
                            disabled={isSending}
                            onClick={() => void sendMessage(item.question)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.24, delay: index * 0.08, ease: "easeOut" }}
                            className="w-fit cursor-pointer rounded-full border border-white/15 bg-[#19191c] px-3 py-2 text-left text-[11px] text-zinc-300 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-white disabled:cursor-not-allowed"
                          >
                            {item.question}
                          </motion.button>
                        ))}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-[#151517] p-3"
                  >
                    <label className="sr-only" htmlFor="support-message">
                      Tulis pesan
                    </label>
                    <input
                      id="support-message"
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      disabled={isSending || isBotTyping}
                      placeholder="Tulis pertanyaan..."
                      autoComplete="off"
                      className="h-10 min-w-0 flex-1 rounded-md border border-white/10 bg-[#202024] px-3 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || isSending || isBotTyping}
                      aria-label="Kirim pesan"
                      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-red-600 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSending ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </form>
                </div>
              )}

                <nav
                aria-label="Navigasi chat"
                className="page-background grid h-[62px] shrink-0 grid-cols-2 border-t border-white/10 p-1.5"
              >
                <button
                  type="button"
                  onClick={() => setView("home")}
                  aria-current={view === "home" ? "page" : undefined}
                  className={`cursor-pointer flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium transition ${
                    view === "home"
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <House size={17} />
                  Beranda
                </button>
                <button
                  type="button"
                  onClick={() => setView(messages.length ? "chat" : "inbox")}
                  aria-current={view === "inbox" || view === "chat" ? "page" : undefined}
                  className={`cursor-pointer flex flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium transition ${
                    view === "inbox" || view === "chat"
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <MessageCircle size={17} />
                  Pesan
                </button>
              </nav>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}