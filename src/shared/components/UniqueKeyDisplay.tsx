import { useState } from "react";
import { Copy, Check, Key } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface UniqueKeyDisplayProps {
  uniqueKey: string;
  className?: string;
}

export const UniqueKeyDisplay = ({ uniqueKey, className = "" }: UniqueKeyDisplayProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uniqueKey);
      setCopied(true);
      toast.success(t('uniqueKey.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('uniqueKey.copyFailed'));
    }
  };

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 ${className}`}>
      <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{t('uniqueKey.label')}</div>
        <code className="text-sm font-mono text-foreground truncate block">{uniqueKey}</code>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-8 w-8 p-0 flex-shrink-0"
        aria-label={t('uniqueKey.copy')}
      >
        {copied ? (
          <Check className="h-4 w-4 text-stm" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
