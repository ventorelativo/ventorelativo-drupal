<?php

declare(strict_types=1);

namespace Drupal\mapper\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\geofield\Plugin\Field\FieldWidget\GeofieldDefaultWidget;

/**
 * Defines the 'unep_map_maptiler_selector' field widget.
 *
 * @FieldWidget(
 *   id = "unep_map_maptiler_selector",
 *   label = @Translation("UNEP Maptiler selector"),
 *   field_types = {
 *     "geofield"
 *   }
 * )
 */
final class MaptilerSelectorWidget extends GeofieldDefaultWidget {

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);

    $element['value']['#attributes']['readonly'] = "readonly";

    // UNEP MapTiler plugin.
    $element['map']['#attached']['library'][] = 'mapper/maptiler-widget';

    return $element;
  }

}
