<?php

declare(strict_types=1);

namespace Drupal\helper\Plugin\Block;

use Drupal\Core\Block\Attribute\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\StringTranslation\TranslatableMarkup;

/**
 * Provides a theme_toggle block.
 */
#[Block(
  id: 'helper_theme_toggle',
  admin_label: new TranslatableMarkup('Theme toggle'),
  category: new TranslatableMarkup('Bootstrap'),
)]
final class ThemeToggleBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    return [
      // '#markup' => $this->t('It works!'),
      '#theme' => 'theme_toggle',
    ];
  }

}
