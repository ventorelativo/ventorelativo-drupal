<?php

declare(strict_types=1);

namespace Drupal\mapper\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a maptiler home map block.
 *
 * @Block(
 *   id = "mapper_maptiler_map",
 *   admin_label = @Translation("Maptiler map"),
 *   category = @Translation("Maps"),
 * )
 */
final class MaptilerMapBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'url' => '/api/sites/all/geo.json',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state): array {
    $form['url'] = [
      '#type' => 'link',
      '#title' => $this->t('GeoJSON URL'),
      '#default_value' => $this->configuration['url'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state): void {
    $this->configuration['url'] = $form_state->getValue('url');
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $build['content'] = [
      '#url' => $this->configuration['url'],
      '#theme' => 'mapper_map',
    ];
    return $build;
  }

}
