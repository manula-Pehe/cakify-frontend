import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { inquiryFormSchema, InquiryFormValues } from '@/lib/validators';
import { inquiryService } from '@/services/inquiryService';
import { inquiryCategoryService } from '../../services/inquiryCategoryService';
import { InquiryCategoryResponse, InquiryResponse, InquiryRequest } from '@/types/inquiry';
import { VALIDATION_RULES } from '@/lib/constants';

export default function InquiryContact() {
  const [categories, setCategories] = useState<InquiryCategoryResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<InquiryResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryCategoryId: undefined,
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await inquiryCategoryService.getActiveCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please refresh the page.',
          variant: 'destructive',
        });
      }
    })();
  }, [toast]);

  const onSubmit = async (values: InquiryFormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
  // values shape matches InquiryRequest; assert to satisfy TS
  const response = await inquiryService.createInquiry(values as InquiryRequest);
      setSubmittedInquiry(response);
      setSubmitSuccess(true);
      toast({
        title: 'Inquiry Submitted Successfully!',
        description: `Your inquiry ID is #${response.id}. We'll respond within 24-48 hours.`,
      });
      form.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      const msg =
        (error && typeof error.message === 'string' && error.message) ||
        'Failed to submit inquiry. Please try again.';
      toast({
        title: 'Submission Failed',
        description: String(msg),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLength = form.watch('message')?.length || 0;
  const maxMessageLength = VALIDATION_RULES.MESSAGE.MAX;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600">Have a question? We're here to help!</p>
      </div>

      {submitSuccess && submittedInquiry && (
        <Alert className="mb-6 border-green-300 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-semibold">Inquiry Submitted Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            <div className="mt-2">
              <p className="font-medium">
                Your inquiry ID: <span className="font-mono text-lg">#{submittedInquiry.id}</span>
              </p>
              <p className="mt-2">We'll get back to you at <strong>{submittedInquiry.email}</strong>.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
          <CardDescription>Fill out the form and we'll respond ASAP.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inquiryCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (optional)</FormLabel>
                    <Select value={field.value ? String(field.value) : ''} onValueChange={(v) => field.onChange(Number(v))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choosing a category helps us route your inquiry.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Short subject" maxLength={VALIDATION_RULES.SUBJECT.MAX} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Type your message..." {...field} />
                    </FormControl>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {messageLength}/{maxMessageLength}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📧 Email Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">You'll get a confirmation email immediately.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⏱️ Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">We typically respond within 24 hours.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🔒 Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Your info is secure and only used to reply.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
