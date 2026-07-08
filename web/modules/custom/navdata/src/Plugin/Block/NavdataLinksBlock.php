<?php

declare(strict_types=1);

namespace Drupal\navdata\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
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
  public function build(): array {
    return [
      '#type' => 'component',
      '#component' => 'navdata:navdata-links',
      '#props' => [
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
    ];
  }

}
