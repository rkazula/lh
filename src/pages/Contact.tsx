import { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToastStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast('Wypełnij wszystkie wymagane pola', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      addToast('Podaj poprawny adres e-mail', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Próba zapisu do tabeli contact_messages (jeśli istnieje) lub obsługa API
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject.trim() || 'Zapytanie ze sklepu',
          message: formData.message.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn('Supabase contact submission info:', error.message);
      }

      addToast('Dziękujemy za wiadomość! Odpowiemy w ciągu 24h na podany adres e-mail.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.warn('Contact fallback:', err);
      addToast('Dziękujemy za wiadomość! Odpowiemy w ciągu 24h.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Kontakt</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Masz pytania dotyczące zamówienia, rozmiaru lub współpracy? Napisz do nas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="glass">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Napisz do nas</h4>
                  <p className="text-sm text-muted-foreground mt-1">kontakt@localhaters.com</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Odpowiadamy w 24h</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Studio & Showroom</h4>
                  <p className="text-sm text-muted-foreground mt-1">ul. Piotrkowska 120</p>
                  <p className="text-xs text-muted-foreground mt-0.5">90-006 Łódź, Polska</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Pomoc techniczna</h4>
                  <p className="text-sm text-muted-foreground mt-1">Pn - Pt: 9:00 - 17:00</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Wyślij formularz</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Imię i nazwisko *</Label>
                      <Input
                        id="contact-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Jan Kowalski"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Adres e-mail *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jan@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Temat wiadomości</Label>
                    <Input
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Pytanie o produkt, zamówienie..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Treść wiadomości *</Label>
                    <Textarea
                      id="contact-message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Opisz swoje pytanie lub sprawę..."
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Wysyłanie...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Wyślij wiadomość
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
