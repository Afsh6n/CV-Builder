import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_PERCENT } from '@app/core/constants/resume.constants';
import { Skill, SkillDisplayType, SkillLevel } from '@app/core/types/resume.types';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';




type ChartMode = Exclude<SkillDisplayType, 'cards'>;

@Component({
  selector: 'app-skill-chart',
  imports: [NgApexchartsModule],
  templateUrl: './skill-chart.html',
  styleUrl: './skill-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillChart {
  skills = input.required<Skill[]>();
  displayType = input.required<ChartMode>();
  primaryColor = input('#3b82f6');
  accentColor = input('#2563eb');
  fontFamily = input("'Vazirmatn', Tahoma, sans-serif");

  private chartId = computed(
    () => `${this.displayType()}-${(this.skills() || []).map(s => `${s.id}:${s.level}`).join('|')}`
  );

  radialSeries = computed(() => (this.skills() || []).map(s => SKILL_LEVEL_PERCENT[s.level] || 0));
  radialLabels = computed(() => (this.skills() || []).map(s => s.name || ''));

  radialChart = computed((): ApexChart => ({
    id: `radial-${this.chartId()}`,
    type: 'radialBar',
    height: Math.min(Math.max(this.skills().length * 80, 260), 420),
    toolbar: { show: false },
    fontFamily: this.fontFamily()
  }));

  radialColors = computed(() => [
    this.primaryColor(),
    this.accentColor(),
    '#6366f1',
    '#8b5cf6',
    '#0ea5e9',
    '#14b8a6',
    '#f59e0b',
    '#ef4444',
    '#10b981'
  ]);

  individualOptions = computed(() => (this.skills() || []).map(skill => {
    const percent = SKILL_LEVEL_PERCENT[skill.level] || 0;
    return {
      series: [percent],
      chart: {
        type: 'radialBar' as const,
        height: 140,
        sparkline: { enabled: true },
        fontFamily: this.fontFamily()
      },
      plotOptions: {
        radialBar: {
          hollow: { size: '45%' },
          track: { background: '#f1f5f9', strokeWidth: '100%' },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 5,
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155',
              formatter: () => skill.name
            }
          }
        }
      },
      colors: [this.primaryColor()],
      stroke: { lineCap: 'round' as const }
    };
  }));

  radialPlotOptions = computed((): ApexPlotOptions => ({
    radialBar: {
      offsetY: 0,
      hollow: { size: '32%' },
      track: { background: '#e2e8f0', strokeWidth: '100%' },
      dataLabels: {
        name: { fontSize: '12px', fontWeight: 600, color: '#334155' },
        value: {
          fontSize: '14px',
          fontWeight: 700,
          color: this.primaryColor(),
          formatter: (val: number) => `${Math.round(val)}%`
        },
        total: { show: false }
      }
    }
  }));

  radialStroke = computed((): ApexStroke => ({ lineCap: 'round' }));
  radialLegend = computed((): ApexLegend => ({
    show: true,
    position: 'bottom',
    fontFamily: this.fontFamily()
  }));

  tooltipOptions = computed((): ApexTooltip => ({ enabled: true }));

  pieChart = computed((): ApexChart => ({
    id: `pie-${this.chartId()}`,
    type: 'pie',
    height: 320,
    fontFamily: this.fontFamily()
  }));

  pieOptions = computed((): ApexPlotOptions => ({
    pie: {
      expandOnClick: true,
      donut: { size: '65%' }
    }
  }));

  pieSeries = computed(() => (this.skills() || []).map(s => SKILL_LEVEL_PERCENT[s.level] || 0));
  pieLabels = computed(() => (this.skills() || []).map(s => s.name || ''));

  barSeries = computed(() => [{
    name: 'سطح',
    data: (this.skills() || []).map(s => SKILL_LEVEL_PERCENT[s.level] || 0)
  }]);

  barChart = computed((): ApexChart => {
    const horizontal = this.displayType() === 'bar';
    const count = (this.skills() || []).length;
    return {
      id: `bar-${this.chartId()}`,
      type: 'bar',
      height: horizontal ? Math.max(count * 48, 140) : Math.max(220, count * 40 + 80),
      toolbar: { show: false },
      fontFamily: this.fontFamily(),
      animations: { enabled: true, speed: 400 }
    };
  });

  barPlotOptions = computed((): ApexPlotOptions => {
    const horizontal = this.displayType() === 'bar';
    return {
      bar: {
        horizontal,
        borderRadius: 4,
        barHeight: horizontal ? '62%' : undefined,
        columnWidth: horizontal ? undefined : '52%',
        dataLabels: { position: horizontal ? 'center' : 'top' }
      }
    };
  });

  barColors = computed(() => [this.primaryColor()]);

  barDataLabels = computed((): ApexDataLabels => ({
    enabled: true,
    formatter: (val: number) => `${Math.round(val)}%`,
    style: { fontSize: '11px', fontWeight: 600, colors: ['#fff'] }
  }));

  barXAxis = computed((): ApexXAxis => {
    const horizontal = this.displayType() === 'bar';
    const names = (this.skills() || []).map(s => s.name || '');
    return {
      categories: names,
      max: horizontal ? 100 : undefined,
      tickAmount: horizontal ? 5 : undefined,
      labels: {
        show: !horizontal,
        style: { fontSize: '12px', colors: '#334155', fontFamily: this.fontFamily() }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    };
  });

  barYAxis = computed((): ApexYAxis => ({
    max: this.displayType() === 'bar' ? undefined : 100,
    labels: {
      show: true,
      style: { fontSize: '12px', colors: '#334155', fontFamily: this.fontFamily() }
    }
  }));

  barGrid = computed((): ApexGrid => ({
    borderColor: '#e2e8f0',
    padding: { left: this.displayType() === 'bar' ? 8 : 0, right: 8 }
  }));

  barTooltip = computed((): ApexTooltip => ({
    enabled: true,
    y: {
      formatter: (val: number) => `${val}% — ${SKILL_LEVEL_LABELS[this.valueToLevel(val)]}`
    }
  }));

  barLegend = computed((): ApexLegend => ({ show: false }));

  private valueToLevel(val: number): SkillLevel {
    if (val >= 100) return 5;
    if (val >= 80) return 4;
    if (val >= 60) return 3;
    if (val >= 40) return 2;
    return 1;
  }
}
