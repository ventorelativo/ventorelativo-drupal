<?php

declare(strict_types = 1);

namespace Drupal\scraper\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Http\ClientFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Psr\Http\Client\ClientInterface;
use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a scraper block.
 *
 * @Block(
 *   id = "scraper_scraper",
 *   admin_label = @Translation("Scraper"),
 *   category = @Translation("Scraper"),
 * )
 */
final class ScraperBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs the plugin instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private readonly CacheBackendInterface $cacheStatic,
    private readonly ClientFactory $httpClientFactory,
    private readonly ClientInterface $httpClient,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cache.static'),
      $container->get('http_client_factory'),
      $container->get('http_client'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'example' => $this->t('Hello world!'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state): array {
    $form['example'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Example'),
      '#default_value' => $this->configuration['example'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state): void {
    $this->configuration['example'] = $form_state->getValue('example');
  }

  /**
   * {@inheritdoc}
   */
  public function scrape(): string {
    $client = new HttpBrowser();
    $crawler = $client->request('GET', 'https://www.xcontest.org/world/en/flights-search/?filter%5Bpoint%5D=7.164612+44.898234&filter%5Bradius%5D=18719&filter%5Bmode%5D=START&filter%5Bdate_mode%5D=dmy&filter%5Bdate%5D=2023&filter%5Bvalue_mode%5D=dst&filter%5Bmin_value_dst%5D=&filter%5Bcatg%5D=FAI3&filter%5Broute_types%5D=&filter%5Bavg%5D=&filter%5Bpilot%5D=&list%5Bsort%5D=pts&list%5Bdir%5D=down');
    // dump($crawler);
    $scraped = $crawler->filter('div.wsw > p')->first()->html();
    // dump($scraped);

    return $scraped;
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $build['content'] = [
      '#markup' => $this->scrape(),
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account): AccessResult {
    // @todo Evaluate the access condition here.
    return AccessResult::allowedIf(TRUE);
  }

}
