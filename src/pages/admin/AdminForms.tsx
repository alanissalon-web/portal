import React, { useEffect, useState } from 'react';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';

type StepConfig = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  multiSelect: boolean;
};

type OutcomeRule = {
  id: string;
  triggerStepId: string;
  triggerOption: string;
  resultTitle: string;
  resultDescription: string;
};

type FormConfig = {
  steps: StepConfig[];
  rules: OutcomeRule[];
  fallbackResult: { title: string; description: string };
};

const defaultFallback = {
  title: 'Personalized Service + Diagnosis',
  description: 'Based on your answers, we\'ll design a personalized plan during your visit with a complimentary diagnosis.',
};

export default function AdminForms() {
  const [config, setConfig] = useState<FormConfig>({ steps: [], rules: [], fallbackResult: defaultFallback });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await LocalDB.getContent('booking_wizard');
      if (data) {
        setConfig({
          steps: data.steps || [],
          rules: data.rules || [],
          fallbackResult: data.fallbackResult || defaultFallback,
        });
      } else {
        // Provide an initial default so they aren't starting from completely blank
        setConfig({
          steps: [
            { id: 'step-1', title: 'What are you looking for?', subtitle: 'Select the service', options: ['Cut & Style', 'Color'], multiSelect: false }
          ],
          rules: [],
          fallbackResult: defaultFallback
        });
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await LocalDB.saveContent('booking_wizard', config);
    if (error) {
      toast({ title: 'Error saving form', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Form configuration saved' });
    }
    setSaving(false);
  };

  // Step Management
  const addStep = () => {
    setConfig(prev => ({
      ...prev,
      steps: [...prev.steps, { id: `step-${Date.now()}`, title: 'New Question', subtitle: 'Subtitle text', options: ['Option 1'], multiSelect: false }]
    }));
  };

  const updateStep = (id: string, field: keyof StepConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeStep = (id: string) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id),
      rules: prev.rules.filter(r => r.triggerStepId !== id) // Remove rules referencing this step
    }));
  };

  const addOption = (stepId: string) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, options: [...s.options, `Option ${s.options.length + 1}`] } : s)
    }));
  };

  const updateOption = (stepId: string, optIndex: number, val: string) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(s => {
        if (s.id === stepId) {
          const newOpts = [...s.options];
          newOpts[optIndex] = val;
          return { ...s, options: newOpts };
        }
        return s;
      })
    }));
  };

  const removeOption = (stepId: string, optIndex: number) => {
    setConfig(prev => ({
      ...prev,
      steps: prev.steps.map(s => {
        if (s.id === stepId) {
          const newOpts = [...s.options];
          newOpts.splice(optIndex, 1);
          return { ...s, options: newOpts };
        }
        return s;
      })
    }));
  };

  // Rule Management
  const addRule = () => {
    const firstStep = config.steps[0];
    const firstOption = firstStep?.options[0] || '';
    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, {
        id: `rule-${Date.now()}`,
        triggerStepId: firstStep?.id || '',
        triggerOption: firstOption,
        resultTitle: 'New Recommendation',
        resultDescription: 'Description of the recommendation'
      }]
    }));
  };

  const updateRule = (id: string, field: keyof OutcomeRule, value: any) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const removeRule = (id: string) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== id)
    }));
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Booking Form Builder</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Configure questions, options, and smart recommendations.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 shadow-lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Form
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="font-display text-xl font-medium">Questions (Steps)</h2>
          <Button variant="outline" onClick={addStep} className="gap-2 rounded-xl text-xs"><Plus className="w-3.5 h-3.5" /> Add Question</Button>
        </div>

        {config.steps.map((step, stepIndex) => (
          <div key={step.id} className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 relative group">
            <button onClick={() => removeStep(step.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid md:grid-cols-2 gap-4 pr-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Title (Question)</label>
                <input 
                  type="text" 
                  value={step.title} 
                  onChange={e => updateStep(step.id, 'title', e.target.value)}
                  className="w-full bg-secondary/30 border border-black/5 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Subtitle</label>
                <input 
                  type="text" 
                  value={step.subtitle} 
                  onChange={e => updateStep(step.id, 'subtitle', e.target.value)}
                  className="w-full bg-secondary/30 border border-black/5 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`multi-${step.id}`}
                checked={step.multiSelect} 
                onChange={e => updateStep(step.id, 'multiSelect', e.target.checked)} 
                className="rounded text-accent focus:ring-accent"
              />
              <label htmlFor={`multi-${step.id}`} className="font-body text-sm text-foreground cursor-pointer">Allow selecting multiple options</label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Options</label>
                <Button variant="ghost" size="sm" onClick={() => addOption(step.id)} className="h-7 text-xs text-accent"><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {step.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2 bg-secondary/20 p-1.5 pl-3 rounded-lg border border-black/5">
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={e => updateOption(step.id, oIndex, e.target.value)}
                      className="flex-1 bg-transparent text-sm font-body outline-none min-w-0"
                    />
                    <button onClick={() => removeOption(step.id, oIndex)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-white transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-8 border-t">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="font-display text-xl font-medium">Smart Recommendations</h2>
            <p className="text-sm text-muted-foreground mt-1">All matching rules are combined into a single personalized response based on the user's selections.</p>
          </div>
          <Button variant="outline" onClick={addRule} className="gap-2 rounded-xl text-xs"><Plus className="w-3.5 h-3.5" /> Add Rule</Button>
        </div>

        {config.rules.map((rule, ruleIndex) => (
          <div key={rule.id} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 shadow-sm space-y-4 relative group">
            <button onClick={() => removeRule(rule.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4 flex-wrap pr-8">
              <span className="font-bold text-sm text-amber-800">IF USER SELECTS:</span>
              <select 
                value={rule.triggerStepId} 
                onChange={e => {
                  const sId = e.target.value;
                  const firstOpt = config.steps.find(s => s.id === sId)?.options[0] || '';
                  updateRule(rule.id, 'triggerStepId', sId);
                  updateRule(rule.id, 'triggerOption', firstOpt);
                }}
                className="bg-white border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-accent"
              >
                {config.steps.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <span className="text-muted-foreground text-sm">→</span>
              <select
                value={rule.triggerOption}
                onChange={e => updateRule(rule.id, 'triggerOption', e.target.value)}
                className="bg-white border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-accent"
              >
                {(config.steps.find(s => s.id === rule.triggerStepId)?.options || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Recommend Title</label>
                <input 
                  type="text" 
                  value={rule.resultTitle} 
                  onChange={e => updateRule(rule.id, 'resultTitle', e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Recommend Description</label>
                <textarea 
                  value={rule.resultDescription} 
                  onChange={e => updateRule(rule.id, 'resultDescription', e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-slate-500" />
            <span className="font-bold text-sm text-slate-700">FALLBACK RECOMMENDATION (If no rules match)</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Title</label>
              <input 
                type="text" 
                value={config.fallbackResult.title} 
                onChange={e => setConfig(prev => ({ ...prev, fallbackResult: { ...prev.fallbackResult, title: e.target.value } }))}
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Description</label>
              <textarea 
                value={config.fallbackResult.description} 
                onChange={e => setConfig(prev => ({ ...prev, fallbackResult: { ...prev.fallbackResult, description: e.target.value } }))}
                rows={2}
                className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 font-body text-sm outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
