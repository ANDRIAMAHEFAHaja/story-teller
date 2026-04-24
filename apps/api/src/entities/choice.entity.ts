import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from './page.entity';

@Entity('choices')
export class Choice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_page_id' })
  fromPageId: string;

  @ManyToOne(() => Page, (page) => page.choices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_page_id' })
  fromPage: Page;

  @Column({ name: 'to_page_id' })
  toPageId: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_page_id' })
  toPage: Page;

  @Column()
  label: string;
}
