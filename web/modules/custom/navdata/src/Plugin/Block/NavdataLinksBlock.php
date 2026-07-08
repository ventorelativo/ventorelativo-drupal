<?php

declare(strict_types=1);

namespace Drupal\navdata\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Url;

/**
 * Provides download links for the flight computer files.
 */
#[Block(
  id: 'navdata_links',
  admin_label: new TranslatableMarkup('Nav Data links'),
  category: new TranslatableMarkup('Custom'),
)]
final class NavdataLinksBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'description' => [
        'value' => '',
        'format' => 'restricted_html',
      ],
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state): array {
    $form['description'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Description'),
      '#default_value' => $this->configuration['description']['value'],
      '#format' => $this->configuration['description']['format'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state): void {
    $this->configuration['description'] = $form_state->getValue('description');
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $description = $this->configuration['description']['value'];
    return [
      '#type' => 'component',
      '#component' => 'navdata:navdata-links',
      '#props' => [
        'hasDescription' => trim(strip_tags($description)) !== '',
        'links' => [
          [
            'url' => Url::fromRoute('navdata.openair')->toString(),
            'title' => (string) $this->t('Airspace (OpenAir)'),
          ],
          [
            'url' => Url::fromRoute('navdata.cup')->toString(),
            'title' => (string) $this->t('Waypoints (SeeYou CUP)'),
          ],
        ],
      ],
      '#slots' => [
        'description' => [
          '#type' => 'processed_text',
          '#text' => $description,
          '#format' => $this->configuration['description']['format'],
        ],
      ],
    ];
  }

}
