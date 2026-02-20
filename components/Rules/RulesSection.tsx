/**
 * RulesSection.tsx
 * -----------------
 * Displays structured league rules with admin-only editing controls.
 * Supports creating, updating, and attaching image references for each rule block.
 */

"use client";

import React, { useState } from "react";
import Card from "@/components/common/Card/Card";
import { Rule, RuleImage } from "@/types/rules";
import styles from "./RulesSection.module.css";

interface RulesSectionProps {
  rules: Rule[];
  isAdmin: boolean;
  onRulesChange: (rules: Rule[]) => void;
}

const emptyRule: Rule = {
  id: "",
  title: "",
  description: "",
  images: [],
};

const RulesSection: React.FC<RulesSectionProps> = ({ rules, isAdmin, onRulesChange }) => {
  const [draft, setDraft] = useState<Rule | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const openCreate = () => {
    setDraft({ ...emptyRule });
    setIsCreating(true);
  };

  const openEditorFor = (rule: Rule) => {
    setDraft({
      ...rule,
      images: (rule.images ?? []).map((image) => ({ ...image })),

    });
    setIsCreating(false);
  };

  const closeEditor = () => {
    setDraft(null);
    setIsCreating(false);
  };

  const handleDraftChange = (field: keyof Pick<Rule, "title" | "description">, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageChange = (imageId: string, field: keyof RuleImage, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        images: prev.images.map((image) =>
          image.id === imageId ? { ...image, [field]: value } : image
        ),
      };
    });
  };

  const handleAddImage = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const newImage: RuleImage = {
        id: `temp-image-${Date.now()}`,
        src: "",
        alt: "",
      };
      return { ...prev, images: [...prev.images, newImage] };
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, images: prev.images.filter((image) => image.id !== imageId) };
    });
  };

  const assignImageIds = (ruleId: string, images: RuleImage[]) =>
    images.map((image, index) => ({
      ...image,
      id: image.id.startsWith("temp-image-")
        ? `${ruleId}-image-${index + 1}-${Date.now()}`
        : image.id,
    }));

  const handleSave = () => {
    if (!draft) {
      return;
    }

    const title = draft.title.trim();
    const description = draft.description.trim();

    if (!title || !description) {
      alert("Title and text are required before saving.");
      return;
    }

    const cleanedImages = draft.images
      .map((image) => ({
        ...image,
        src: image.src.trim(),
        alt: image.alt.trim(),
      }))
      .filter((image) => !!image.src);

    if (isCreating) {
      const newRuleId = `rule-${Date.now()}`;
      const newRule: Rule = {
        id: newRuleId,
        title,
        description,
        images: assignImageIds(newRuleId, cleanedImages),
      };
      onRulesChange([...rules, newRule]);
    } else {
      const updatedRule: Rule = {
        ...draft,
        title,
        description,
        images: assignImageIds(draft.id, cleanedImages),
      };
      const updatedRules = rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule));
      onRulesChange(updatedRules);
    }

    closeEditor();
  };

  return (
    <section id="rules" className={styles.section} aria-labelledby="rules-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>League Handbook</p>
          <h2 id="rules-heading">Rules &amp; Policies</h2>
        </div>
        {isAdmin && (
          <button type="button" className={styles.actionButton} onClick={openCreate}>
            Add Rule
          </button>
        )}
      </div>

      <div className={styles.rulesList}>
        {rules.map((rule) => (
          <Card key={rule.id} className={styles.ruleCard}>
            <div className={styles.ruleRow}>
              <div className={styles.textColumn}>
                <div className={styles.ruleTitleGroup}>
                  <h3 className={styles.ruleTitle}>{rule.title}</h3>
                  <span className={styles.ruleUnderline} aria-hidden="true" />
                </div>
                <div className={styles.ruleBody}>
                  {rule.description.split("\n").map((paragraph, index) => (
                    <p key={`${rule.id}-paragraph-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
              {(rule.images ?? []).length > 0 && (
                <div className={styles.imageColumn}>
                  {(rule.images ?? []).map((image) => (
                    <figure key={image.id} className={styles.imageFrame}>
                      <img src={image.src} alt={image.alt || rule.title} />
                      {image.alt && <figcaption>{image.alt}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}

            </div>
            {isAdmin && (
              <div className={styles.ruleActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => openEditorFor(rule)}
                >
                  Edit Rule
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {draft && (
        <div className={styles.editorOverlay} role="dialog" aria-modal="true">
          <Card className={styles.editorCard}>
            <div className={styles.editorHeader}>
              <h3>{isCreating ? "Add Rule" : "Edit Rule"}</h3>
              <button type="button" className={styles.closeButton} onClick={closeEditor}>
                Close
              </button>
            </div>
            <div className={styles.editorBody}>
              <label className={styles.field}>
                <span>Title</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => handleDraftChange("title", event.target.value)}
                  placeholder="Rule title"
                />
              </label>
              <label className={styles.field}>
                <span>Text</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => handleDraftChange("description", event.target.value)}
                  placeholder="Describe the policy..."
                  rows={5}
                />
              </label>
              <div className={styles.imagesFieldset}>
                <div className={styles.imagesFieldHeader}>
                  <span>Images</span>
                  <button type="button" className={styles.secondaryButton} onClick={handleAddImage}>
                    Add Image
                  </button>
                </div>
                {draft.images.length === 0 && (
                  <p className={styles.helperText}>No images added yet.</p>
                )}
                {draft.images.map((image) => (
                  <div key={image.id} className={styles.imageInputs}>
                    <label>
                      <span>Image URL</span>
                      <input
                        type="url"
                        value={image.src}
                        onChange={(event) => handleImageChange(image.id, "src", event.target.value)}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </label>
                    <label>
                      <span>Alt text</span>
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(event) => handleImageChange(image.id, "alt", event.target.value)}
                        placeholder="Describe the photo"
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.editorFooter}>
              <button type="button" className={styles.secondaryButton} onClick={closeEditor}>
                Cancel
              </button>
              <button type="button" className={styles.actionButton} onClick={handleSave}>
                {isCreating ? "Add Rule" : "Save Rule"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

export default RulesSection;

