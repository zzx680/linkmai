-- ============================================================
-- LinkMai Migration: 功能 2 - 模板系统
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- ============================================================

-- draft_templates: 工作流模板表
CREATE TABLE IF NOT EXISTS draft_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  doc_type text NOT NULL,
  prompt_md text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 策略
ALTER TABLE draft_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System templates visible to all"
  ON draft_templates FOR SELECT
  TO authenticated
  USING (is_system = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own templates"
  ON draft_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON draft_templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete their own templates"
  ON draft_templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- 索引
CREATE INDEX IF NOT EXISTS idx_draft_templates_user_id ON draft_templates(user_id) WHERE is_system = false;
CREATE INDEX IF NOT EXISTS idx_draft_templates_doc_type ON draft_templates(doc_type);

-- 内置 5 个中国法律模板
INSERT INTO draft_templates (user_id, title, doc_type, prompt_md, is_system) VALUES
(NULL, '劳动合同纠纷起诉状', 'complaint',
E'请起草一份劳动合同纠纷起诉状，必须包含以下关键要素：\n\n1. **劳动者信息**：姓名、入职日期、岗位、月工资标准\n2. **劳动合同情况**：是否签订书面合同、合同期限、试用期约定\n3. **工资支付情况**：是否存在拖欠/克扣工资，计算欠薪金额\n4. **工时与加班**：是否安排加班、是否支付加班费、计算加班费差额\n5. **解除/终止原因**：单位解除理由是否合法、是否履行法定程序\n6. **经济补偿/赔偿金**：计算基数、工作年限、应得金额\n7. **社会保险**：是否缴纳社保、是否有损失赔偿请求\n\n请在事实与理由部分引用《劳动合同法》相关条文，诉讼请求金额须逐项列明计算过程。', true),

(NULL, '买卖合同纠纷起诉状', 'complaint',
E'请起草一份买卖合同纠纷起诉状，必须包含以下关键要素：\n\n1. **合同签订情况**：合同编号、签订日期、标的物名称及规格\n2. **合同金额与付款方式**：总价款、已付款、未付款\n3. **交付情况**：交付时间、交付数量、是否存在迟延交付\n4. **质量争议**：是否存在质量问题、是否有检验报告\n5. **违约行为**：买方未付款/卖方未交货/质量不合格等\n6. **损失计算**：直接损失、可得利益损失、违约金\n7. **证据清单**：合同、送货单、付款凭证、检验报告等\n\n诉讼请求应逐项列明，违约金计算须有合同依据或法定标准。', true),

(NULL, '合同风险审查', 'contract',
E'请对以下合同进行风险审查，重点检查以下方面：\n\n1. **主体资格风险**：签约主体是否具有相应资质和履约能力\n2. **合同标的条款**：标的物描述是否明确、规格质量标准是否具体\n3. **价格与付款条款**：付款节点是否合理、是否设置先履行抗辩权\n4. **违约责任条款**：违约金比例是否过高/过低、是否对双方公平\n5. **管辖条款**：是否约定不利管辖法院、是否有独家管辖限制\n6. **不平等条款**：是否存在单方解除权、免责条款是否合法\n7. **知识产权条款**：权属约定是否清晰、是否有限制使用条款\n8. **保密与竞业限制**：保密范围是否过宽、竞业限制期限和范围是否合法\n9. **不可抗力与情势变更**：约定是否完整\n10. **争议解决条款**：仲裁与诉讼选择是否明确\n\n请按风险等级（高/中/低）逐条列出问题，并给出修改建议。', true),

(NULL, '律师函（催款）', 'lawyer_letter',
E'请起草一份催款律师函，必须包含以下要素：\n\n1. **债务关系说明**：欠款原因（货款/借款/服务费等）、欠款金额、产生时间\n2. **催款事实**：历次催收情况、对方回应\n3. **法律依据**：引用《民法典》合同编相关条文\n4. **还款要求**：明确还款金额、还款期限（一般7-15日）\n5. **逾期后果**：将提起诉讼、申请财产保全、主张违约金和律师费\n6. **联系方式**：收款账户信息、联系人及电话\n\n语气应正式有力但不失专业，措辞严谨、法律威慑力强。', true),

(NULL, '股权转让协议审查', 'contract',
E'请对以下股权转让协议进行审查，重点检查：\n\n1. **转让标的**：股权比例、对应出资额、实缴情况是否清晰\n2. **转让价格**：定价依据是否合理、是否涉及国资须评估\n3. **付款方式与时间**：分期付款安排、先决条件是否明确\n4. **陈述与保证**：转让方保证是否充分（权属、无质押、无诉讼等）\n5. **限制性条款**：竞业禁止、优先购买权、拖售权/随售权\n6. **过渡期安排**：管理权交接、期间损益归属\n7. **违约责任**：违约情形是否穷尽、违约金是否合理\n8. **税务条款**：税费承担约定是否清晰\n9. **审批与登记**：是否需主管部门审批、工商变更登记责任\n10. **退出机制**：回购条款、对赌条款是否合法有效\n\n请按风险等级逐条分析并给出修改建议。', true);


-- ============================================================
-- LinkMai Migration: 功能 1 - 材料提取系统
-- ============================================================

-- materials: 上传的原始材料
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  filename text NOT NULL,
  content text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'text',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- material_reviews: 材料提取任务
CREATE TABLE IF NOT EXISTS material_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  columns_config jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- material_cells: 提取结果单元格
CREATE TABLE IF NOT EXISTS material_cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES material_reviews(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  column_index integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  UNIQUE(review_id, material_id, column_index)
);

-- RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own materials" ON materials FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own materials" ON materials FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own materials" ON materials FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users see own reviews" ON material_reviews FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own reviews" ON material_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own reviews" ON material_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users see own cells" ON material_cells FOR SELECT TO authenticated
  USING (review_id IN (SELECT id FROM material_reviews WHERE user_id = auth.uid()));
CREATE POLICY "Users create own cells" ON material_cells FOR INSERT TO authenticated
  WITH CHECK (review_id IN (SELECT id FROM material_reviews WHERE user_id = auth.uid()));
CREATE POLICY "Users update own cells" ON material_cells FOR UPDATE TO authenticated
  USING (review_id IN (SELECT id FROM material_reviews WHERE user_id = auth.uid()));

-- 索引
CREATE INDEX IF NOT EXISTS idx_materials_case_id ON materials(case_id);
CREATE INDEX IF NOT EXISTS idx_material_reviews_case_id ON material_reviews(case_id);
CREATE INDEX IF NOT EXISTS idx_material_cells_review_id ON material_cells(review_id);
CREATE INDEX IF NOT EXISTS idx_material_cells_material_id ON material_cells(material_id);
